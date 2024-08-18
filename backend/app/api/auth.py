import json
import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, verify_password, get_password_hash
from app.schemas.user import UserCreate, Token
import logging
from app.core.utils import USERS_FILE, SCORES_FILE, HASHED_PASSWORDS_DIR, load_json, save_json


router = APIRouter()
logger = logging.getLogger(__name__)

def get_hashed_password(email):
    file_path = os.path.join(HASHED_PASSWORDS_DIR, email, "hashed_password.txt")
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return f.read().strip()
    return None

def save_hashed_password(email, hashed_password):
    os.makedirs(os.path.join(HASHED_PASSWORDS_DIR, email), exist_ok=True)
    file_path = os.path.join(HASHED_PASSWORDS_DIR, email, "hashed_password.txt")
    with open(file_path, "w") as f:
        f.write(hashed_password)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    users = load_json(USERS_FILE)
    if form_data.username not in users:
        logger.warning(f"Login failed: User not found for email: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    hashed_password = get_hashed_password(form_data.username)
    if not hashed_password or not verify_password(form_data.password, hashed_password):
        logger.warning(f"Login failed: Incorrect password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": form_data.username})
    logger.info(f"Login successful for user: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    users = load_json(USERS_FILE)
    if user_data.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    save_hashed_password(user_data.email, hashed_password)
    
    users[user_data.email] = {
        "email": user_data.email,
        "is_active": True
    }
    save_json(USERS_FILE, users)
    
    scores = load_json(SCORES_FILE)
    scores[user_data.email] = 0
    save_json(SCORES_FILE, scores)
    
    logger.info(f"New user registered: {user_data.email}")
    return {"message": "User created successfully"}