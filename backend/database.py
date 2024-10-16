from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Float, Enum, Date, BigInteger, UUID, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, validates
from sqlalchemy import LargeBinary

from datetime import datetime, UTC
from uuid import uuid4
import enum
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'sql_redarena.db')}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserRole(enum.Enum):
    RedTeam = "RedTeam"
    BlueTeam = "BlueTeam"
    Admin = "Admin"
    
class GameState(enum.Enum):
    WIN = "win"
    LOSS = "loss"
    FORFEITED = "forfeited"
    PLAYING = "playing"
    
    def __str__(self):
        return str(self.value)

class TemporaryRegistration(Base):
    __tablename__ = "temporary_registrations"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    registration_token = Column(String, unique=True)
    token_expiration = Column(DateTime)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String)
    score = Column(Integer, default=0)
    identicon = Column(LargeBinary)
    role = Column(Enum(UserRole), default=UserRole.Admin, nullable=False)
    created_at = Column(DateTime, default=datetime.now(UTC))

class GameSession(Base):
    __tablename__ = "game_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(32), index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, default=datetime.now(UTC))
    end_time = Column(DateTime, nullable=True)
    state = Column(Enum(GameState), default=GameState.PLAYING)
    target_phrase = Column(String)
    score = Column(Float, default=0.0)
    share = Column(Boolean, default=False)
    history = Column(JSON, default=list)

class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    release_date = Column(Date)
    genre = Column(String())  # Store as a comma-separated string
    publisher = Column(String(100))
    difficulty = Column(Integer, default=0)  # Difficulty from 0 to 10
    created_at = Column(DateTime, default=datetime.now(UTC))
    created_by = Column(Integer, ForeignKey("users.id"))
    times_played = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    total_tokens_used = Column(BigInteger, default=0)
    target_phase = Column(String, nullable=False)  # New column for target phase (can be a regex)
    examples = Column(String())

    @validates('target_phase')
    def validate_target_phase(self, key, target_phase):
        if not target_phase:
            raise ValueError("Target phase cannot be empty")
        
        if target_phase.startswith('^') and target_phase.endswith('$'):
            try:
                re.compile(target_phase)
            except re.error:
                raise ValueError("Invalid regular expression for target phase")
        
        return target_phase
    
    

    # Utility methods to handle genre as a list of strings
    @property
    def genre_list(self):
        return self.genre.split(',') if self.genre else []

    @property
    def example_list(self):
        return self.examples.split(',') if self.examples else []

    @property
    def win_loss_ratio(self):
        return self.wins / self.losses if self.losses > 0 else float('inf')
    
    @property
    def difficulty_description(self):
        if self.difficulty <= 2:
            return "Very Easy"
        elif self.difficulty <= 4:
            return "Easy"
        elif self.difficulty <= 6:
            return "Medium"
        elif self.difficulty <= 8:
            return "Hard"
        else:
            return "Very Hard"

    @genre_list.setter
    def genre_list(self, genres):
        self.genre = ','.join(genres)
        
    @example_list.setter
    def example_list(self, genres):
        self.genre = ','.join(genres)
    
    @validates('difficulty')
    def validate_difficulty(self, key, value):
        if value < 0 or value > 10:
            raise ValueError("Difficulty must be between 0 and 10")
        return value

class JailbreakPost(Base):
    __tablename__ = "jailbreak_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(100), nullable=False)
    prompt = Column(Text)
    model = Column(String)
    created_at = Column(DateTime, default=datetime.now(UTC))
    updated_at = Column(DateTime, nullable=True)
    visibility = Column(String, default="public")  # Public, private, friends_only
    
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()