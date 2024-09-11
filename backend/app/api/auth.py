import json
import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.core.security import create_access_token, verify_password, get_password_hash, get_current_user, settings
from app.schemas.user import UserCreate, Token
import logging
from app.core.utils import DB_DIR, load_txt, save_txt

router = APIRouter()
logger = logging.getLogger(__name__)

def get_hashed_password(username):
    file_path = os.path.join(DB_DIR, username, "hashed_password.txt")
    return load_txt(file_path)

def create_user(username, hashed_password):
    user_dir = os.path.join(DB_DIR, username)
    os.makedirs(user_dir, exist_ok=True)
    save_txt(os.path.join(user_dir, "hashed_password.txt"), hashed_password)

def get_users_list(return_anonymous=False):
    os.makedirs(DB_DIR, exist_ok=True)
    users = os.listdir(DB_DIR)
    if not return_anonymous:
        users = [u for u in users if u != "anonymous"]
    return users

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    users = get_users_list(return_anonymous=True)
    logger.info(users)
    if form_data.username not in users:
        logger.warning(f"Login failed: User not found for username: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No username found. (Go back and register?)",
        )
    hashed_password = get_hashed_password(form_data.username)
    if not verify_password(form_data.password, hashed_password):
        logger.warning(f"Login failed: Incorrect password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    access_token = create_access_token(data={"sub": form_data.username})
    logger.info(f"Login successful for user: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    users = get_users_list(return_anonymous=True)
    if user_data.username in users:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user_data.password)
    create_user(user_data.username, hashed_password)
    logger.info(f"New user registered: {user_data.username}")
    return {"message": "User created successfully"}