from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, conint
from datetime import date
from typing import Optional, List

# Import your database models and session
from api.database import get_db, Game, User, UserRole
from api.core.security import get_current_user

router = APIRouter()

class GameCreate(BaseModel):
    title: str
    description: Optional[str] = None
    release_date: Optional[date] = None
    genre: Optional[List[str]] = None  # Changed to a list of strings
    publisher: Optional[str] = None
    target_phrase : str = ""
    difficulty: conint(ge=0, le=10)  # Validates that difficulty is between 0 and 10
    examples: Optional[List[str]] = None  # New field for examples, which is an optional string

    

def check_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.Admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_game(
    game: GameCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    # Convert the genre list to a comma-separated string
    genre_str = ','.join(game.genre) if game.genre else None

    db_game = Game(
        title=game.title,
        description=game.description,
        release_date=game.release_date,
        genre=genre_str,  # Use the comma-separated string
        publisher=game.publisher,
        difficulty=game.difficulty,  # Include difficulty
        created_by=current_user.id,
        target_phase=game.target_phrase
    )
    
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    
    return db_game

@router.get("/")
def list_games(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(check_admin),
    db: Session = Depends(get_db)
):
    games = db.query(Game).offset(skip).limit(limit).all()
    return games

@router.get("/{game_id}", dependencies=[Depends(check_admin)])
def get_game(
    game_id: int,
    db: Session = Depends(get_db)
):
    
    game = db.query(Game).filter(Game.id == game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.put("/{game_id}")
def update_game(
    game_id: int,
    game: GameCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    db_game = db.query(Game).filter(Game.id == game_id, Game.created_by == current_user.id).first()
    if db_game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Convert the genre list to a comma-separated string
    genre_str = ','.join(game.genre) if game.genre else None
    example_str = ','.join(game.examples) if game.ex else None
    
    # Update the attributes of the game
    db_game.title = game.title
    db_game.description = game.description
    db_game.release_date = game.release_date
    db_game.genre = genre_str  # Use the comma-separated string
    db_game.publisher = game.publisher
    db_game.difficulty = game.difficulty  # Include difficulty
    db_game.target_phase = game.target_phrase
    db_game.examples = example_str
    

    db.commit()
    db.refresh(db_game)
    return db_game


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    db_game = db.query(Game).filter(Game.id == game_id, Game.created_by == current_user.id).first()
    
    if db_game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    
    db.delete(db_game)
    db.commit()
    return {"ok": True}

# In your main FastAPI app file, you would include this router like this:
# from .admin_routes import router as admin_router
# app.include_router(admin_router, prefix="/admin")