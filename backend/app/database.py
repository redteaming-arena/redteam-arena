import json
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Boolean, Float, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func

import enum
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'sql_redarena.db')}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class GameState(enum.Enum):
    WIN = "win"
    LOSS = "loss"
    PLAYING = "playing"
    FORFEIT = "forfeit"
    

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(32), index=True)
    username = Column(String(), index=True)
    state = Column(Enum(GameState), default=GameState.PLAYING)
    target_phrase = Column(String)
    model = Column(String)
    endpoint = Column(String)
    provider = Column(String)
    share = Column(Boolean, default=False)
    history = Column(JSON, default=list)
    timestamp = Column(DateTime, default=func.now())


    def to_dict(self):
        return {
            "session_id" : self.session_id,
            "username" : self.username,
            "state" : self.state.value,
            "target_phrase" : self.target_phrase,
            "model" : self.model,
            "provider" :  self.provider,
            "endpoint": self.endpoint,
            "share" : self.share,
            "chat_history": json.loads(self.history) if isinstance(self.history, str) else self.history,
        }        

class Leaderboard(Base):
    __tablename__ = "leaderboards"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    entries = relationship("LeaderboardEntry", back_populates="leaderboard")

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id = Column(Integer, primary_key=True, index=True)
    leaderboard_id = Column(Integer, ForeignKey("leaderboards.id"), index=True)
    category = Column(String, index=True)
    item = Column(String, index=True)
    score = Column(Float)
    delta = Column(Float)

    leaderboard = relationship("Leaderboard", back_populates="entries")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
