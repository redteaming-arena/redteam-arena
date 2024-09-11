# app/core/config.py

from pydantic_settings import BaseSettings
from .secretKey import secretKey

class Settings(BaseSettings):
    PROJECT_NAME: str = "Red-Teaming Arena"
    ALLOWED_ORIGINS: list = ["https://www.redarena.ai", "https://redarena.ai", "http://redarena.ai"]
    SECRET_KEY: str = secretKey
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300000

settings = Settings()
