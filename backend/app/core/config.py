# app/core/config.py

from pydantic_settings import BaseSettings
from typing import List
import dotenv
from pydantic import Field

dotenv.load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Red-Teaming Arena"
    ALLOWED_ORIGINS: List[str] = ["*"]
    SECRET_KEY: str
    FIREBASE_CREDENTIAL_PATH: str = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300000
    redis_host: str = Field(..., alias="REDIS_HOST")
    redis_port: int = Field(..., alias="REDIS_PORT")
    redis_password: str = Field(..., alias="REDIS_PASSWORD")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
