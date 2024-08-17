# app/api/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, verify_password, get_password_hash
from app.schemas.user import UserCreate, Token
from app.db.database import users_db, score_db
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    if form_data.username not in users_db:
        logger.warning(f"Login failed: User not found for email: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    user = users_db[form_data.username]
    if not verify_password(form_data.password, user["hashed_password"]):
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
    if user_data.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    users_db[user_data.email] = {
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "is_active": True
    }
    score_db[user_data.email] = 0
    logger.info(f"New user registered: {user_data.email}")
    return {"message": "User created successfully"}

# You might have other auth-related endpoints here, such as logout, refresh token, etc.