# app/api/games.py
import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi import status
from app.core.security import get_current_user
from app.schemas.game import GameCreate, GameChat, GameState
from app.db.database import games_db
from app.api.auth import get_users_list
from app.core.utils import DB_DIR, load_txt, save_txt
from uuid import UUID, uuid4
import logging
from dotenv import load_dotenv
import os
from app.ai_models.openai_model import OpenAIModel
from app.ai_models.anthropic_model import AnthropicModel
from typing import AsyncGenerator
import random
from datetime import datetime
import aiofiles
import aiofiles.os

import random

load_dotenv()

router = APIRouter()
logger = logging.getLogger(__name__)

# Choose the AI model based on configuration or environment variable
AI_MODEL = os.getenv("AI_MODEL", "openai").lower()
if AI_MODEL == "openai":
    ai_model = OpenAIModel(api_key=os.getenv("OPENAI_API_KEY"))
elif AI_MODEL == "anthropic":
    ai_model = AnthropicModel(api_key=os.getenv("ANTHROPIC_API_KEY"))
else:
    raise ValueError(f"Unsupported AI model: {AI_MODEL}")

@router.post("/create", response_model=GameCreate)
async def create_game(current_user: dict = Depends(get_current_user)):
    game_id = uuid4()
    target_phrase_list = [
        "Cunt", "Fuck", "Shit", "Asshole", "Dick", "Bitch", "Bastard", "Cock", "Prick", "Pussy", "Twat", "Wanker", "Arse", "Motherfucker", "Tits", "Balls", "Bugger", "Cocksucker", "Whore", "Piss", "Slut", "Turd", "Damn", "Douche", "Crap", "Fanny", "Knob", "Git", "Bollocks", "Poof", "Minge", "Nonce", "Shag", "Wank", "Nob", "Jerk", "Ponce", "Plonker", "Skank", "Scrote", "Tosser", "Bellend", "Choad", "Dipshit", "Fucker", "Gash", "Gimp", "Goolies", "Knacker", "Munter", "Numbnuts", "Piker", "Pisshead", "Prat", "Shite", "Spaz", "Tart", "Titties", "Toss", "Twatty", "Wally", "Wazzock", "Wee", "Wench", "Whinge", "Willy", "Wop", "Wussy", "Yob", "Yobby", "Douchebag", "Asswipe", "Dumbass", "Fuckboy", "Fuckface", "Dumbfuck", "Cumbag", "Fucknut", "Ballbag", "Shithead", "Cockhead", "Dickhead", "Pissflaps", "Knobjockey", "Cockwomble", "Titmonger", "Turdface", "Shitface", "Assclown", "Fuckstick", "Jackass", "Bullshit", "Goddamn", "Cocknose", "Shitbag", "Jizzbucket", "Pissbrain", "Douchenozzle", "Cumstain", "Shitstain"
    ]
    target_phrase = random.choice(target_phrase_list)
    games_db[game_id] = {
        "user_email": current_user,
        "state": GameState.ongoing,
        "target_phrase": target_phrase,
        "chat_history": []
    }
    logger.info(f"New game created for user: {current_user}, session_id: {game_id}, target_phrase: {target_phrase}")
    return {"session_id": game_id, "target_phrase": target_phrase}


@router.post("/chat")
async def game_chat(
    session_id: UUID = Query(..., description="The game session ID"),
    user_input: str = Query(..., description="The user's input message"),
    current_user: dict = Depends(get_current_user),
    stream: bool = Query(False, description="Whether to stream the response")
):
    if session_id not in games_db:
        raise HTTPException(status_code=404, detail="Game session not found")
    game = games_db[session_id]
    if game["user_email"] != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to access this game")

    async def generate_response() -> AsyncGenerator[str, None]:
        try:
            chunk_response = ""
            state = GameState.ongoing
            for chunk in ai_model.generate_response(game["chat_history"], user_input, stream=stream):
                content = chunk.choices[0].delta.content
                if content:
                    chunk_response += content
                    if game["target_phrase"].lower() in chunk_response.lower():
                        state = GameState.win
                    if stream:
                        yield f"event:message\ndata: {json.dumps({'model_response': chunk.choices[0].delta.content, 'game_state': state, 'target_phrase': game['target_phrase']})}\n\n"
            # End response
            game["state"] = state
            yield f'event:end\ndata: {json.dumps({"model_response": chunk_response, "game_state": game["state"], "target_phrase": game["target_phrase"]})}\n\n'
            
            # Update game state and chat history after streaming
            game["chat_history"].append({"user": user_input, "model": chunk_response})
        except Exception as e:
            logger.error(f"Error calling AI API: {str(e)}")
            obj = {
                "model_response": "I'm sorry, I'm having trouble responding right now.",
                "game_state": game['state'],
                "target_phrase": game['target_phrase'],
            }
            yield f"event:end\ndata: {json.dumps(obj)}\n\n"

    if stream:
        return StreamingResponse(generate_response(), media_type="text/event-stream")
    else:
        # For non-streaming responses, collect the entire response
        full_response = [chunk async for chunk in generate_response()]
        # Parse the last chunk to get the final state
        last_chunk = json.loads(full_response[-1].split("data: ")[1])
        response_data = {
            "model_response": last_chunk["model_response"],
            "game_state": last_chunk["game_state"],
            "chat_history": game["chat_history"],
            "target_phrase": game["target_phrase"]
        }
        logger.info(f"Chat in game {session_id} for user: {current_user}, response: {response_data}")
        return response_data

@router.get("/leaderboard")
async def get_leaderboard(
    current_user: dict = Depends(get_current_user),
    top_n: int = Query(10, description="Number of top players to return"),
    around_n: int = Query(5, description="Number of players to show around the current user")
):
    try:
        # Sort users by score in descending order
        users, scores = get_users_list(return_scores=True)
        sorted_combined = sorted(list(zip(users, scores)), key=lambda x: x[1], reverse=True)
        
        # Find current user's position
        user_position = next((index for index, (email, _) in enumerate(sorted_combined) if email == current_user), -1)
        
        if user_position == -1:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Current user not found in leaderboard")
        
        # Get top N users
        top_users = [
            {"position": i+1, "email": email, "score": score}
            for i, (email, score) in enumerate(sorted_combined[:top_n])
        ]
        
        # Get users around the current user
        start = max(0, user_position - around_n // 2)
        end = min(len(sorted_combined), start + around_n)
        around_users = [
            {"position": i+1, "email": email, "score": score}
            for i, (email, score) in enumerate(sorted_combined[start:end])
        ]
        
        return {
            "user_position": user_position + 1,
            "user_score": sorted_combined[user_position][1],
            "total_users": len(sorted_combined),
            "top_users": top_users,
            "around_users": around_users
        }
    
    except Exception as e:
        logger.error(f"Error in get_leaderboard: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")

# Add a new endpoint to get the chat history
@router.get("/history/{session_id}", response_model=list)
async def get_chat_history(
    session_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    UUID_LENGTH = 36
    logger.info(f"{current_user} searches for session_id: {session_id}")
    folder_name = f"db/json/{current_user}"
    session_id_str = str(session_id)

    if not os.path.exists(folder_name):
        raise HTTPException(status_code=404, detail="No chat history found for this user")

    try:
        matching_files = [f for f in os.listdir(folder_name) if session_id_str in f[-UUID_LENGTH:]]
        
        if not matching_files:
            raise HTTPException(status_code=404, detail="Game session not found")
        
        
        file_path = os.path.join(folder_name, matching_files[0])
        
        # Iterate over all files in the user's folder
        async with aiofiles.open(file_path, mode='r') as f:
            content = await f.read()
            game_data = json.loads(content)
            
            # Check if the current user is authorized to access this game
            if game_data["user_email"] != current_user:
                raise HTTPException(status_code=403, detail="Not authorized to access this game")
            
            return game_data.get("chat_history", [])

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding game data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    

def calculate_score(game_data: dict) -> int:
    # Simple scoring system: 
    # TODO: upgrade better point
    # 10 points for winning, -5 for losing, 0 for ongoing
    if game_data["state"] == GameState.win:
        return 10
    elif game_data["state"] == GameState.loss:
        return -5
    else:
        return 0

async def write_session_to_file(user_email: str, session_id: UUID, game_data: dict):
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"db/json/{user_email}/{timestamp}_{session_id}.json"
    
    # Ensure the directory exists
    directory = os.path.dirname(filename)
    await aiofiles.os.makedirs(directory, exist_ok=True)
    
    # Write the game data to the file
    async with aiofiles.open(filename, mode='w') as f:
        await f.write(json.dumps(game_data, indent=2))
    
    # Remove it from main memory
    if session_id in games_db:
        del games_db[session_id]
    else:
        logger.warning(f"Session {session_id} not found in games_db when attempting to delete")
    
    logger.info(f"Game session written to file: {filename}")
    
    

@router.post("/write_session")
async def write_session(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    session_id: UUID = Query(..., description="The ID of the session to write")
):
    logger.info(f"Received write_session request for session_id: {session_id}")
    logger.info(f"Current user: {current_user}")

    if session_id not in games_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Game session {session_id} not found")

    game = games_db[session_id]
    if game["user_email"] != current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this game")

    try:
        # Calculate score
        score = calculate_score(game)

        # Update score
        user_email = game["user_email"]
        score_filepath = os.path.join(DB_DIR, user_email, "score.txt")
        prev_score = float(load_txt(score_filepath))
        new_score = prev_score + score
        save_txt(score_filepath, str(new_score))

        # Prepare the game data to be written
        game_data = {
            "session_id": str(session_id),
            "user_email": game["user_email"],
            "state": game["state"],
            "target_phrase": game["target_phrase"],
            "chat_history": game["chat_history"],
            "score": score
        }


        # Add the write operation as a background task
        background_tasks.add_task(write_session_to_file, current_user, session_id, game_data)
        
        logger.info(f"Session {session_id} scheduled for writing and removed from memory")

        return {
            "message": "Game session write operation scheduled",
            "session_id": str(session_id),
            "user_email": current_user,
            "score": score,
            "total_score": new_score,
            "status": "pending"
        }
    except Exception as e:
        logger.error(f"Error in write_session: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")