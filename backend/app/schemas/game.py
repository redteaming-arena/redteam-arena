# app/schemas/game.py

from pydantic import BaseModel
from enum import Enum
from uuid import UUID

class GameState(str, Enum):
    ongoing = "ongoing"
    win = "win"
    loss = "loss"

class GameCreate(BaseModel):
    session_id: UUID
    target_phrase: str

class GameChat(BaseModel):
    model_response: str
    game_state: GameState
    chat_history: list
    target_phrase: str
