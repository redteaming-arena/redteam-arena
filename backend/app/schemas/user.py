# app/schemas/user.py

from pydantic import BaseModel, validator
import re

class UserCreate(BaseModel):
    username: str
    password: str
    
    @validator('password')
    def password_requirements(cls, v):
        # Minimum length of 8 characters
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    username: str
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str