# app/api/users.py

from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.schemas.user import User

router = APIRouter()

@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user