from pydantic import BaseModel, EmailStr, validator
import re


class UserCreate(BaseModel):
    username: str
    password: str
    
    @validator('password')
    def password_requirements(cls, v):
        # Minimum length of 8 characters
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        # At least one uppercase letter
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        # At least one lowercase letter
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        # At least one digit
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        
        # At least one special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        
        return v
