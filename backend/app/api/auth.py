import json
import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, verify_password, get_password_hash
from app.schemas.user import UserCreate, Token
import logging
from app.core.utils import DB_DIR, load_txt, save_txt

router = APIRouter()
logger = logging.getLogger(__name__)

def get_hashed_password(email):
    file_path = os.path.join(DB_DIR, email, "hashed_password.txt")
    return load_txt(file_path)

def create_user(email, hashed_password):
    save_txt(os.path.join(DB_DIR, email, "hashed_password.txt"), hashed_password)
    save_txt(os.path.join(DB_DIR, email, "score.txt"), "0")

def get_users_list(return_scores=False):
    users = os.listdir(DB_DIR)
    if not return_scores:
        return users
    scores = [ float(load_txt(os.path.join(DB_DIR, u, "score.txt"))) for u in users ]
    return users, scores

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    users = get_users_list()
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
    users = get_users_list()
    if user_data.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    create_user(user_data.email, hashed_password)
    
    logger.info(f"New user registered: {user_data.email}")
    return {"message": "User created successfully"}