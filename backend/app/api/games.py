# app/api/games.py
import os
import json
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user
from app.schemas.game import GameCreate, GameSessionResponse, GameHistoryResponse
from uuid import UUID, uuid4
import logging
import numpy as np
from app.ai_models import sampler
from typing import AsyncGenerator, List
from app.core.utils import DB_DIR
from datetime import datetime
from .targetPhraseList import targets
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.database import get_db, GameSession, GameState
import aiofiles
import aiofiles.os
import string

UUID_LENGTH = 41

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/create", response_model=GameCreate)
async def create_game(current_user: str = Depends(get_current_user), 
                      db: Session = Depends(get_db)):
    
    session_id = str(uuid4())
    p = np.array(list(targets.values())).astype(float)
    p /= p.sum()
    target_phrase = np.random.choice(list(targets.keys()), p=p)
    provider = sampler.sample_provider()
    model = sampler.sample_model(provider)
    
    new_game = GameSession(
        session_id=session_id,
        username=current_user,  # Using username directly
        state=GameState.PLAYING,
        target_phrase=target_phrase,
        provider=provider,
        model=model["name"],
        endpoint=model["endpoint"],
        history=json.dumps([])  # Initialize with empty list
    )
    
    db.add(new_game)
    db.commit()
    
    logger.info(f"New game created for user: {current_user}, session_id: {session_id}, target_phrase: {target_phrase}, model: {model['name']}")
    
    return_dict = {"session_id": session_id, "target_phrase": target_phrase, "model": model["name"]}
    return return_dict


def remove_punctuation(text):
    # Create a translation table that maps each punctuation character to None
    translator = str.maketrans('', '', string.punctuation)
    
    # Use the translation table to remove punctuation
    return text.translate(translator)


@router.post("/chat")
async def game_chat(
    session_id: UUID = Query(..., description="The game session ID"),
    user_input: str = Query(..., description="The user's input message"),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    
    game : GameSession = db.query(GameSession).filter(GameSession.session_id == str(session_id),
                                                      GameSession.username == current_user,
                                                      GameSession.state == GameState.PLAYING).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    client = sampler.get_client(game.provider)
    
    # target = re.escape(game.target_phrase.lower())
    # pattern = rf'\b{target}\b'

    async def generate_response() -> AsyncGenerator[str, None]:
        nonlocal game
        try:
            chunk_response = ""
            state = game.state
            history = game.history
            if isinstance(history, str):
                history = json.loads(history)
            
            translator = str.maketrans('', '', string.punctuation)
            removed_punctuation = game.target_phrase.translate(translator)
            
            history.append({"role": "user", "content": user_input})
            for chunk in client.generate(history, game.endpoint):
                if chunk:
                    chunk_response += chunk
                    if game.target_phrase.lower() in chunk_response.lower() or\
                       removed_punctuation.lower() in chunk_response.lower():
                        state = GameState.WIN
                    yield f"event:message\ndata: {json.dumps({'model_response': chunk, 'game_state': state.value, 'target_phrase': game.target_phrase})}\n\n"
            
            game.state = state
            history.append({"role": "assistant", "content": chunk_response})
            game.history = json.dumps(history)
            db.add(game)
            db.commit()
            yield f'event:end\ndata: {json.dumps({"model_response": chunk_response, "game_state": game.state.value, "target_phrase": game.target_phrase})}\n\n'

        except Exception as e:
            logger.error(f"Error calling AI API: {str(e)}")
            print("Error calling AI API:", str(e))
            obj = {
                "model_response": "I'm sorry, I'm having trouble responding right now.",
                "game_state": game.state.value,
                "target_phrase": game.target_phrase,
            }
            yield f"event:end\ndata: {json.dumps(obj)}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")

@router.post("/share/{session_id}")
async def mark_session_as_shared(
    session_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"{current_user} is marking session_id: {session_id} as shared")
    folder_name = os.path.join(DB_DIR,current_user)
    session_id_str = str(session_id)
    
    game_session = db.query(GameSession).filter(GameSession.session_id == str(session_id)).first()
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    if game_session.username != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to modify this game")
    
    game_session.share = not game_session.share
    db.add(game_session)
    db.commit()

    try:
        matching_files = [f for f in os.listdir(folder_name) if session_id_str in f[-UUID_LENGTH:-4]]
        
        if not matching_files:
            raise HTTPException(status_code=404, detail="Game session not found")
        file_path = os.path.join(folder_name, matching_files[0])
        game_data = {}
        async with aiofiles.open(file_path, mode='r') as f:
            content = await f.read()
            game_data = json.loads(content)
            # Check if the current user is authorized to modify this game
            if game_data.get("username") != current_user:
                raise HTTPException(status_code=403, detail="Not authorized to modify this game")
            
            # Set the share attribute to true
            game_data["share"] = not game_data["share"]
            
            # Save the updated game_data back to the file
            async with aiofiles.open(file_path, mode='w') as f_write:
                content = json.dumps(game_data, indent=4)
                await f_write.write(content)
            
            if game_data["share"]:
                return {"message": "Session marked as shared successfully.", "path" : session_id_str, "shared" : game_data["share"]}
            else:
                return {"message": "Session marked as not shared successfully.", "shared" : game_data["share"]}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding game data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.get("/share/{session_id}")
async def get_shared_chat_history(session_id: UUID):
    
    session_id_str = str(session_id)
    found = False
    file_path = None

    for current_folder, _, files in os.walk(DB_DIR):
        for file_name in files:
            if session_id_str in file_name[-UUID_LENGTH:-4]:  # Check if session_id matches file name
                folder_name = current_folder
                file_path = os.path.join(folder_name, file_name)
                found = True
                break
        if found:
            break
    
    if not found or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Game session not found")

    try:
        async with aiofiles.open(file_path, mode='r') as f:
            content = await f.read()
            game_data : dict = json.loads(content)

            if not game_data.get("share", False):
                raise HTTPException(status_code=403, detail="You do not have read access to this game session")

            chat_history =  game_data.get("chat_history", "[]")
            if isinstance(chat_history, str):
                chat_history = json.loads(chat_history)
            # Return the game data
            return {
                "username": game_data.get("username"),
                "state": game_data.get("state"),
                "target_phrase": game_data.get("target_phrase"),
                "chat_history": [
                    message
                    for message in chat_history
                    if message.get("role", None) != "system"
                ]
            }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding game data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.get("/history", response_model=List[GameHistoryResponse])
async def get_chat_history(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"{current_user} searches history")
    folder_name = f"db/json/{current_user}"
    
    if not os.path.exists(folder_name):
        raise HTTPException(status_code=404, detail="No chat history found for this user")
    
    completed_sessions = []
    for dirpath, _, filenames in os.walk(folder_name):
        for filename in filenames:
            if filename.endswith('.json'):
                file_path = os.path.join(dirpath, filename)
                with open(file_path, 'r') as file:
                    try:
                        session_data = json.load(file)
                    except:
                        print(file_path)
                        continue
                    # Check if the game is completed (not ongoing)
                    if session_data['state'] in ["win", "loss"]:
                        completed_sessions.append({
                            'session_id': session_data['session_id'],
                            'target_phrase': session_data['target_phrase'],
                            'state': session_data['state'],
                            "shared": session_data.get("share", False)
                        })
    
    # Sort completed sessions by session_id in descending order (newest first)
    completed_sessions.sort(key=lambda x: x['session_id'], reverse=True)
    
    # Return the completed sessions
    return completed_sessions
    

@router.get("/history/{session_id}", response_model=GameSessionResponse)
async def get_chat_history_session(
    session_id: UUID,
    current_user: str = Depends(get_current_user)
):
    
    folder_name = f"db/json/{current_user}"
    session_id_str = str(session_id)
    completed_sessions = None

    if not os.path.exists(folder_name):
        raise HTTPException(status_code=404, detail="No chat history found for this user")

    try:
        matching_files = [f for f in os.listdir(folder_name) if session_id_str in f[-UUID_LENGTH:-4]]

        if not matching_files:
            raise HTTPException(status_code=404, detail="Game session not found")


        file_path = os.path.join(folder_name, matching_files[0])

        # Iterate over all files in the user's folder
        async with aiofiles.open(file_path, mode='r') as f:
            content = await f.read()
            game_data = json.loads(content)

            # Check if the current user is authorized to access this game
            if game_data["username"] != current_user:
                raise HTTPException(status_code=403, detail="Not authorized to access this game")

            if game_data['state'] != 'ongoing':
                chat_history =  game_data.get("chat_history", "[]")
                if isinstance(chat_history, str):
                    chat_history = json.loads(chat_history)

                completed_sessions = {
                    "username": game_data.get("username"),
                    "state": game_data.get("state"),
                    "target_phrase": game_data.get("target_phrase"),
                    "chat_history": [
                        message
                        for message in chat_history
                        if message.get("role", None) != "system"
                    ],
                    "shared" : game_data.get("share", False)
                }
    except json.JSONDecodeError:
        
        raise HTTPException(status_code=500, detail="Error decoding game data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    return completed_sessions

async def write_session_to_file(username: str, session_id: UUID, game_data: dict):
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"db/json/{username}/{timestamp}_{session_id}.json"
    
    # Ensure the directory exists
    directory = os.path.dirname(filename)
    await aiofiles.os.makedirs(directory, exist_ok=True)
    
    # Write the game data to the file
    async with aiofiles.open(filename, mode='w') as f:
        await f.write(json.dumps(game_data, indent=2))
    
    logger.info(f"Game session written to file: {filename}")

@router.post("/forfeit")
async def forfeit_session(
    background : BackgroundTasks,
    session_id: UUID,
    username: str,
    db: Session = Depends(get_db)
):
    
    current_username = await get_current_user(username)

    game_session = db.query(GameSession).filter(
        GameSession.session_id == str(session_id),
        GameSession.username == current_username
    ).first()
    
    if game_session is None:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    game_session.state = GameState.FORFEIT
    
    background.add_task(
            write_session_to_file,
            username=current_username,
            session_id=session_id,
            game_data=game_session.to_dict() 
    )

    db.add(game_session)
    db.commit()
    
    return {"message": "Session forfeited successfully"}


@router.post("/write_session")
async def write_session(
    background : BackgroundTasks,
    session_id: UUID,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Received write_session request for session_id: {session_id}")
    
    game_session = db.query(GameSession).filter(
        GameSession.session_id == str(session_id),
        GameSession.username == current_user
    ).first()
    
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    if game_session.state == GameState.PLAYING:
        game_session.state = GameState.LOSS
    try:
        db.add(game_session)
        db.commit()
        logger.info(f"Session {session_id} written successfully")
        
        background.add_task(
            write_session_to_file,
            username=current_user,
            session_id=session_id,
            game_data=game_session.to_dict() 
        )
        
        return {
            "message": "Game session written successfully",
            "username": current_user,
            "provider": game_session.provider,
            "model": game_session.model,
            "state": game_session.state.value,
            "status": "completed"
        }
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error in write_session: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while writing the session: {str(e)}")