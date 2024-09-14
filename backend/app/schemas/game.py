# app/schemas/game.py

from pydantic import BaseModel
from typing import List
from uuid import UUID

class GameCreate(BaseModel):
    session_id: UUID
    target_phrase: str
    model: str


class ChatMessage(BaseModel):
    role: str
    content: str

class GameSessionResponse(BaseModel):
    username: str
    state: str
    target_phrase: str
    chat_history: List[ChatMessage]
    shared: bool

    @classmethod
    def from_game_session(cls, game_session, current_user):
        # Assuming `game_session.history` is a JSON string with the chat messages
        chat_history = [
            ChatMessage(**message) 
            for message in json.loads(game_session.history) 
            if message.get("role") != "system"
        ]
        
        return cls(
            username=current_user,
            state=game_session.state,
            target_phrase=game_session.target_phrase,
            chat_history=chat_history,
            shared=game_session.share
        )

class GameHistoryResponse(BaseModel):
    session_id: str
    target_phrase: str
    state: str
    shared: bool

    @classmethod
    def from_sessions(cls, completed_sessions):
        return [
            cls(
                session_id=session.session_id,
                target_phrase=session.target_phrase,
                state=session.state,
                shared=session.share
            )
            for session in completed_sessions
        ]
