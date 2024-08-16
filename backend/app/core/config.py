# app/core/config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Red-Teaming Arena"
    ALLOWED_ORIGINS: list = ["http://35.192.77.48:8082", "http://35.192.77.48:3000", "http://localhost:3000", "http://35.192.77.48", "http://redarena.ai"]
    SECRET_KEY: str = "YOUR_SECRET_KEY_HERE"  # In production, use a proper secret key
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30000

settings = Settings()
