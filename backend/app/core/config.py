# app/core/config.py

from pydantic_settings import BaseSettings
from typing import List
import dotenv

dotenv.load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Red-Teaming Arena"
    ALLOWED_ORIGINS: List[str] = ["*"]
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
