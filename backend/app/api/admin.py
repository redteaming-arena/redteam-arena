# app/api/admin.py

from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.core.utils import USERS_FILE, load_json

router = APIRouter()

@router.get("/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    users = load_json(USERS_FILE)
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Not authorized")
    return {str(k): v for k, v in users.items()}
