import os
import asyncio
import json
import logging
from uuid import uuid4, UUID
from datetime import datetime
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status, Request
from fastapi.responses import StreamingResponse, RedirectResponse
from sqlalchemy.orm import Session

from dotenv import load_dotenv

from api.core.security import get_current_user
from api.routes.auth import get_username_list
from api.models import OpenAIClient, AnthropicClient
from api.database import get_db, User, Game, GameState, GameSession
import enum

UUID_LENGTH = 41

load_dotenv()

router = APIRouter()
logger = logging.getLogger(__name__)

# Choose the AI model based on configuration or environment variable
AI_MODEL = os.getenv("AI_MODEL", "openai").lower()
if AI_MODEL == "openai":
    ai_model = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
elif AI_MODEL == "anthropic":
    ai_model = AnthropicClient(api_key=os.getenv("ANTHROPIC_API_KEY"), 
                               model_name="claude-3-opus-20240229")
else:
    raise ValueError(f"Unsupported AI model: {AI_MODEL}")


class TerminationState(enum.Enum):
    WIN = 0
    LOSS = 1
    DEFAULT = 2

@router.get("/leaderboard")
async def get_leaderboard(
    db : Session = Depends(get_db)
):
    try:
        # Sort users by score in descending order
        users = get_username_list(db, return_scores=True)
        
        sorted_combined = sorted(users, key=lambda x: x[1], reverse=True)
        
        # Get top N users
        top_users = [
            {"position": i+1, "username": username, "score": score}
            for i, (username, score) in enumerate(sorted_combined)
        ]
        
        return top_users
    
    except Exception as e:
        logger.error(f"Error in get_leaderboard: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")

@router.get("/list")
async def get_games(
    db : Session = Depends(get_db)
):
    return db.query(Game).all()

@router.get("/{game_id}")
async def get_games(
    game_id : int,
    db : Session = Depends(get_db)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.post("/session")
async def create_game_session(
    game_id: int,
    current_user : User=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RedirectResponse:
    """ Create a single session ID for a game and redirect to load the game """
    game = db.query(Game).filter(Game.id == game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    session = db.query(GameSession).filter(GameSession.user_id == current_user.id, 
                                           GameSession.state == GameState.PLAYING).first()
    if session:
        return f"/c/{session.session_id}"
    
    # Get the current user (assuming get_current_user returns the user object)
    session_id = str(uuid4())
    # Create a new GameSession
    new_session = GameSession(
        session_id=session_id,
        user_id=current_user.id,
        state=GameState.PLAYING,
        target_phrase=game.target_phase,
        score=0.0,
        share=False,
        history=[{"role": "system", "content": "Game session started."}]
    )
    db.add(new_session)
    db.commit()

    # Redirect to the load game endpoint
    return f"/c/{session_id}"

@router.delete("/session")
async def delete_game_session(
    session_id : UUID,
    user : User=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RedirectResponse:
    """ Create a single session ID for a game and redirect to load the game """
    session = db.query(GameSession).filter(GameSession.session_id == str(session_id)).first()
    if session is None:
        raise HTTPException(status_code=404, detail="Game session not found")

    if session.user_id != user.id:
        raise HTTPException(status_code=401, detail="Unauthorized session deletion")

    db.delete(session)
    db.commit()

    # Redirect to the load game endpoint
    return { "message" : "session deleted successful", "success" : True}



@router.post("/share")
async def post_shared_game(request : Request, 
                     /,
                     current_user : User=Depends(get_current_user)):
    """ post game session """
    print(request)
    return None

@router.get("/share")
async def get_shared_game(session_id : UUID, request : Request, /):
    """ get shared game session """
    print(request)
    return None




# @router.post("/create", response_model=GameCreate)
# async def create_game(current_user: dict = Depends(get_current_user)):
#     logger.info("Create game.")
#     game_id = uuid4()
#     target_phrase_list = [
#         "Cunt", "Fuck", "Shit", "Asshole", "Dick", "Bitch", "Bastard", "Cock", "Prick", "Pussy", "Twat", "Wanker", "Arse", "Motherfucker", "Tits", "Balls", "Bugger", "Cocksucker", "Whore", "Piss", "Slut", "Turd", "Damn", "Douche", "Crap", "Fanny", "Knob", "Git", "Bollocks", "Poof", "Minge", "Nonce", "Shag", "Wank", "Nob", "Jerk", "Ponce", "Plonker", "Skank", "Scrote", "Tosser", "Bellend", "Choad", "Dipshit", "Fucker", "Gash", "Gimp", "Goolies", "Knacker", "Munter", "Numbnuts", "Piker", "Pisshead", "Prat", "Shite", "Spaz", "Tart", "Titties", "Toss", "Twatty", "Wally", "Wazzock", "Wee", "Wench", "Whinge", "Willy", "Wop", "Wussy", "Yob", "Yobby", "Douchebag", "Asswipe", "Dumbass", "Fuckboy", "Fuckface", "Dumbfuck", "Cumbag", "Fucknut", "Ballbag", "Shithead", "Cockhead", "Dickhead", "Pissflaps", "Knobjockey", "Cockwomble", "Titmonger", "Turdface", "Shitface", "Assclown", "Fuckstick", "Jackass", "Bullshit", "Goddamn", "Cocknose", "Shitbag", "Jizzbucket", "Pissbrain", "Douchenozzle", "Cumstain", "Shitstain"
#     ]
#     target_phrase = random.choice(target_phrase_list)
#     games_db[game_id] = {
#         "username": current_user,
#         "state": GameState.ongoing,
#         "target_phrase": target_phrase,
#         "chat_history": [],
#         "score" : 0
#     }
#     logger.info(f"New game created for user: {current_user}, session_id: {game_id}, target_phrase: {target_phrase}")
#     return {"session_id": game_id, "target_phrase": target_phrase}


# @router.post("/chat")
# async def game_chat(
#     session_id: UUID = Query(..., description="The game session ID"),
#     user_input: str = Query(..., description="The user's input message"),
#     current_user: dict = Depends(get_current_user),
# ):
#     if session_id not in games_db:
#         raise HTTPException(status_code=404, detail="Game session not found")
#     game = games_db[session_id]
#     if game["username"] != current_user:
#         raise HTTPException(status_code=403, detail="Not authorized to access this game")

#     async def generate_response() -> AsyncGenerator[str, None]:
#         try:
#             chunk_response = ""
#             state = GameState.ongoing
#             for chunk in ai_model.generate_response(game["chat_history"], user_input):
#                 if chunk:
#                     chunk_response += chunk
#                     if game["target_phrase"].lower() in chunk_response.lower():
#                         state = GameState.win
#                         game["score"] = calculate_score(state)
                    
#                     yield f"event:message\ndata: {json.dumps({'response': chunk, 'game_state': state, 'target_phrase': game['target_phrase']})}\n\n"
#             # End response
#             game["state"] = state
#             yield f'event:end\ndata: {json.dumps({"response": chunk_response, "game_state": game["state"], "target_phrase": game["target_phrase"]})}\n\n'
            
#             # Update game state and chat history after streaming
#             game["chat_history"].append({"role": "assistant", "content": chunk_response})
#         except Exception as e:
#             logger.error(f"Error calling AI API: {str(e)}")
#             obj = {
#                 "response": "I'm sorry, I'm having trouble responding right now.",
#                 "game_state": game['state'],
#                 "target_phrase": game['target_phrase'],
#             }
#             yield f"event:end\ndata: {json.dumps(obj)}\n\n"

#     return StreamingResponse(generate_response(), media_type="text/event-stream")

# @router.post("/share/{session_id}")
# async def mark_session_as_shared(
#     session_id: UUID,
#     current_user: dict = Depends(get_current_user)
# ):
#     logger.info(f"{current_user} is marking session_id: {session_id} as shared")
#     folder_name = os.path.join(DB_DIR,current_user)
#     session_id_str = str(session_id)
#     query = dict(session_id=session_id_str, username=current_user)
    
#     if not os.path.exists(folder_name):
#         raise HTTPException(status_code=404, detail="No chat history found for this user")

#     try:
#         matching_files = [f for f in os.listdir(folder_name) if session_id_str in f[-UUID_LENGTH:-4]]
        
#         if not matching_files:
#             raise HTTPException(status_code=404, detail="Game session not found")
#         print(matching_files)
#         file_path = os.path.join(folder_name, matching_files[0])
#         game_data = {}
#         async with aiofiles.open(file_path, mode='r') as f:
#             content = await f.read()
#             game_data = json.loads(content)
#             # Check if the current user is authorized to modify this game
#             if game_data.get("username") != current_user:
#                 raise HTTPException(status_code=403, detail="Not authorized to modify this game")
            
#             # Set the share attribute to true
#             game_data["share"] = not game_data["share"]
            
#             # Save the updated game_data back to the file
#             async with aiofiles.open(file_path, mode='w') as f_write:
#                 content = json.dumps(game_data, indent=4)
#                 await f_write.write(content)
            
#             print(CIPHER.encrypt(json.dumps(query).encode()))
#             if game_data["share"]:
#                 return {"message": "Session marked as shared successfully.", "path" : CIPHER.encrypt(json.dumps(query).encode())}
#             else:
#                 return {"message": "Session marked as not shared successfully."}

#     except json.JSONDecodeError:
#         raise HTTPException(status_code=500, detail="Error decoding game data")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# @router.get("/share/{path}",)
# async def get_shared_chat_history(
#     path: str
# ):
#     # Decode the to get session ID and user information
#     try:
#         decoded_query = json.loads(CIPHER.decrypt(path))
#         session_id = decoded_query.get("session_id")
#         user = decoded_query.get("username")
#     except Exception as e:
#          raise HTTPException(status_code=404, detail=f"No chat history found for this user {e}")

#     folder_name = os.path.join(DB_DIR, user)
#     session_id_str = str(session_id)

#     if not os.path.exists(folder_name):
#         raise HTTPException(status_code=404, detail="No chat history found for this user")

#     try:
#         matching_files = [f for f in os.listdir(folder_name) if session_id_str in f[-UUID_LENGTH:-4]]

#         if not matching_files:
#             raise HTTPException(status_code=404, detail="Game session not found")

#         file_path = os.path.join(folder_name, matching_files[0])
#         async with aiofiles.open(file_path, mode='r') as f:
#             content = await f.read()
#             game_data = json.loads(content)

#             if not game_data["share"]:
#                 raise HTTPException(status_code=404, detail="You do not have read access to this game session")
#             # Return the game data
#             return {"state": game_data["state"], "target_phrase": game_data["target_phrase"], "chat_history":  [
#         message
#         for message in game_data.get("chat_history", [])
#         if message.get("role", None) != "system"
#     ]}

#     except json.JSONDecodeError:
#         raise HTTPException(status_code=500, detail="Error decoding game data")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# @router.get("/leaderboard/me")
# async def get_leaderboard(
#     current_user: dict = Depends(get_current_user),
#     top_n: int = Query(10, description="Number of top players to return"),
#     around_n: int = Query(5, description="Number of players to show around the current user")
# ):
#     try:
#         # Sort users by score in descending order
#         users, scores = get_users_list(return_scores=True)
#         sorted_combined = sorted(list(zip(users, scores)), key=lambda x: x[1], reverse=True)
        
#         # Get top N users
#         top_users = [
#             {"position": i+1, "username": username, "score": score}
#             for i, (username, score) in enumerate(sorted_combined[:top_n])
#         ]

#         if current_user == "anonymous":
#             return {
#                 "username"  : "anonymous",
#                 "user_position": None,
#                 "user_score": None,
#                 "total_users": len(sorted_combined),
#                 "top_users": top_users,
#                 "around_users": []
#             }

#         else:
#             # Find current user's position
#             user_position = next((index for index, (username, _) in enumerate(sorted_combined) if username == current_user), -1)
            
#             if user_position == -1:
#                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Current user not found in leaderboard")
            
#         # Get users around the current user
#         start = max(0, user_position - around_n // 2)
#         end = min(len(sorted_combined), start + around_n)
#         around_users = [
#             {"position": i+1, "username": username, "score": score}
#             for i, (username, score) in enumerate(sorted_combined[start:end])
#         ]
        
#         return {
#             "username"  : current_user,
#             "user_position": user_position + 1,
#             "user_score": sorted_combined[user_position][1],
#             "total_users": len(sorted_combined),
#             "top_users": top_users,
#             "around_users": around_users
#         }
    
#     except Exception as e:
#         logger.error(f"Error in get_leaderboard: {str(e)}", exc_info=True)
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")

# # Add a new endpoint to get the chat history
# @router.get("/history/{session_id}", response_model=list)
# async def get_chat_history(
#     session_id: UUID,
#     current_user: dict = Depends(get_current_user)
# ):
#     UUID_LENGTH = 36
#     logger.info(f"{current_user} searches for session_id: {session_id}")
#     folder_name = f"db/json/{current_user}"
#     session_id_str = str(session_id)

#     if not os.path.exists(folder_name):
#         raise HTTPException(status_code=404, detail="No chat history found for this user")

#     try:
#         matching_files = [f for f in os.listdir(folder_name) if session_id_str in f[-UUID_LENGTH:]]
        
#         if not matching_files:
#             raise HTTPException(status_code=404, detail="Game session not found")
        
        
#         file_path = os.path.join(folder_name, matching_files[0])
        
#         # Iterate over all files in the user's folder
#         async with aiofiles.open(file_path, mode='r') as f:
#             content = await f.read()
#             game_data = json.loads(content)
            
#             # Check if the current user is authorized to access this game
#             if game_data["username"] != current_user:
#                 raise HTTPException(status_code=403, detail="Not authorized to access this game")
            
#             return game_data.get("chat_history", [])

#     except json.JSONDecodeError:
#         raise HTTPException(status_code=500, detail="Error decoding game data")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# async def write_session_to_file(username: str, session_id: UUID, game_data: dict):
    
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     filename = f"db/json/{username}/{timestamp}_{session_id}.json"
    
#     # Ensure the directory exists
#     directory = os.path.dirname(filename)
#     await aiofiles.os.makedirs(directory, exist_ok=True)
    
#     # Write the game data to the file
#     async with aiofiles.open(filename, mode='w') as f:
#         await f.write(json.dumps(game_data, indent=2))
    
#     # Remove it from main memory
#     if session_id in games_db:
#         del games_db[session_id]
#     else:
#         logger.warning(f"Session {session_id} not found in games_db when attempting to delete")
    
#     logger.info(f"Game session written to file: {filename}")
    
    

# @router.post("/write_session")
# async def write_session(
#     background_tasks: BackgroundTasks,
#     current_user: dict = Depends(get_current_user),
#     session_id: UUID = Query(..., description="The ID of the session to write")
# ):
#     logger.info(f"Received write_session request for session_id: {session_id}")
#     logger.info(f"Current user: {current_user}")

#     if session_id not in games_db:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Game session {session_id} not found")

#     game = games_db[session_id]
#     if game["username"] != current_user:
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this game")

#     try:
#         # Calculate score
#         score = game["score"]

#         # Update score
#         username = game["username"]
#         score_filepath = os.path.join(DB_DIR, username, "score.txt")
#         prev_score = float(load_txt(score_filepath))
#         new_score = prev_score + score
#         save_txt(score_filepath, str(new_score))

#         # Prepare the game data to be written
#         game_data = {
#             "session_id": str(session_id),
#             "username": game["username"],
#             "state": game["state"] if GameState.win else GameState.loss,
#             "target_phrase": game["target_phrase"],
#             "chat_history": game["chat_history"],
#             "score": score,
#             "share" : False
#         }


#         # Add the write operation as a background task
#         background_tasks.add_task(write_session_to_file, current_user, session_id, game_data)
        
#         logger.info(f"Session {session_id} scheduled for writing and removed from memory")

#         return {
#             "message": "Game session write operation scheduled",
#             "username": current_user,
#             "score": score,
#             "total_score": new_score,
#             "state": game_data["state"],
#             "status": "pending"
#         }
#     except Exception as e:
#         logger.error(f"Error in write_session: {str(e)}", exc_info=True)
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")