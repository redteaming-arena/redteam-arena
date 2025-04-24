import json
import os
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, verify_password, get_password_hash
from app.schemas.user import UserCreate, Token
from app.core.firestore import db  # Firestore client

router = APIRouter()
logger = logging.getLogger(__name__)

def get_user_doc(username):
    return db.collection("users").document(username)

def get_hashed_password(username):
    doc = get_user_doc(username).get()
    if not doc.exists:
        return None
    return doc.to_dict().get("hashed_password")

def create_user(username, hashed_password):
    user_data = {
        "username": username,
        "hashed_password": hashed_password,
        "is_active": True,
        "elo": 0,
        "games_played": 0,
        "games_won": 0,
        "games_lost": 0
    }
    get_user_doc(username).set(user_data)

def get_users_list(return_anonymous=False):
    users_ref = db.collection("users").stream()
    usernames = [doc.id for doc in users_ref]
    if not return_anonymous:
        usernames = [u for u in usernames if u != "anonymous"]
    return usernames

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
    if not hashed_password or not verify_password(form_data.password, hashed_password):
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
    doc_ref = get_user_doc(user_data.username)
    if doc_ref.get().exists:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user_data.password)
    create_user(user_data.username, hashed_password)
    logger.info(f"New user registered: {user_data.username}")
    return {"message": "User created successfully"}