from datetime import datetime

from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from dotenv import load_dotenv

from api.core.security import get_current_user
from api.routes.auth import get_username_list
from api.database import get_db, User, Game
from typing import Optional, List, Literal

router = APIRouter()

class CreateJailbreakPost(BaseModel):
    title: str
    prompt: str
    visibility: Literal['public', 'private']  # e.g., "public", "private", "friends_only"
    model : str

@router.post("/")
async def post_jailbreak(post : CreateJailbreakPost, user : User=Depends(get_current_user), db : Session = Depends(get_db)):
    ...

async def update_jailbreak(post : CreateJailbreakPost, user : User=Depends(get_current_user), db : Session = Depends(get_db)):
    ...

@router.get("/")
async def get_jailbreaks(user : User=Depends(get_current_user), db : Session = Depends(get_db)):
    ...
    
@router.post()
async def feedback_jailbreak(feedback : bool, db : Session = Depends(get_db)):
    ...