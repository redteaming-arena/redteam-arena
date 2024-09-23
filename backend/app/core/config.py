# app/core/config.py

import os
from pydantic_settings import BaseSettings
import dotenv

dotenv.load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Red-Teaming Arena"
    ALLOWED_ORIGINS: list = ["*"] if (os.environ.get("ENV") == "DEV") else ["https://www.redarena.ai", "https://redarena.ai", "http://redarena.ai"]
    SECRET_KEY: str = os.environ.get("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300000

settings = Settings()
