from __future__ import annotations

from pydantic import BaseModel
from io import BytesIO
from enum import Enum
from uuid import UUID
from pydantic import BaseModel, EmailStr


class CreateUserRequest(BaseModel):
    email: str
    password : str
    
class UserLoginRequest(BaseModel):
    username: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    
    
class User(BaseModel):
    # id: int
    email: EmailStr
    # username : str
    # image : BytesIO

class Token(BaseModel):
    access_token : str
    token_type : str

class GameState(str, Enum):
    ongoing = "ongoing"
    win = "win"
    loss = "loss"

class GameCreate(BaseModel):
    session_id: UUID
    target_phrase: str

class GameChat(BaseModel):
    response: str
    game_state: GameState
    chat_history: list
    target_phrase: str
