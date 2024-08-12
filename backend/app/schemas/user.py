# app/schemas/user.py

from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    email: EmailStr
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str