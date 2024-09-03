from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import logging
from datetime import datetime, timedelta
from pydantic import EmailStr



from api.core.security import create_access_token, verify_password, get_password_hash
from api.types import Token
from api.database import get_db, User, TemporaryRegistration
from api.core.utils import generate_identicon
from api.core.security import settings, get_current_temp_reg, get_current_user
from api.service.email import send_magic_link
from api.schemas.user import UserCreate

from jose import jwt, JWTError

router = APIRouter()
logger = logging.getLogger(__name__)

def get_token_from_header(request: Request):
    authorization: str = request.headers.get("Authorization")
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")
    
    return token

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_temp_by_email(db: Session, email: str):
    return db.query(TemporaryRegistration).filter(TemporaryRegistration.email == email).first()

def create_user(db: Session, email: str, hashed_password: str, username : str):
    identicon = generate_identicon(username)
    db_user = User(email=email, hashed_password=hashed_password, username=username, identicon=identicon)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_username_list(db: Session, return_scores=False):
    users = db.query(User).all()
    if not return_scores:
        return [user.email for user in users]
    return [(user.username, user.score) for user in users]

def get_users_list(db: Session, return_scores=False):
    users = db.query(User).all()
    if not return_scores:
        return [user.email for user in users]
    return [(user.email, user.score) for user in users]

@router.get("/validate")
async def is_valid_email(email : EmailStr, db : Session = Depends(get_db)):
    user = get_user_by_email(db, email)
    print("Validate", user)
    if user is None:
        return { "message" : "user not found", "success" : False}
    else:
        return { "message" : "user found", "success" : True}
    

@router.post("/login", response_model=Token)
async def login(
    response : Response,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)):
    logger.info(f"Login attempt for user: {form_data.username}")
    user = get_user_by_email(db, form_data.username)
    if not user:
        logger.warning(f"Login failed: User not found for email: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Login failed: Incorrect password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": user.email})
    
    cookie_max_age = int(settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    response.set_cookie(key="ra_token_verification", value=access_token, httponly=True, max_age=cookie_max_age, samesite="strict")
    response.set_cookie(key="username", value=user.username, httponly=True, max_age=cookie_max_age, samesite="strict")
    
    logger.info(f"Login successful for user: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(response : Response, 
                 request  : Request,
                 current_user: User = Depends(get_current_user), db : Session = Depends(get_db) ):
    try:    
        # Here you would typically invalidate the token
        # This could involve adding the token to a blacklist or updating the user's record
        token = get_token_from_header(request)
        
        # Add the token to the blacklist
        # blacklisted_token = TokenBlacklist(token=, expires_at=token_exp)
        # db.add(blacklisted_token)
        
        # For example, you could update a 'last_logout' field on the user
        current_user.last_logout = datetime.utcnow()
        db.commit()

        response.delete_cookie(
                key="ra_token_verification",
                httponly=True,
                secure=True,  # Set to True if using HTTPS
                samesite="lax"  # Or "strict", depending on your security requirements
        )
        
        return {"message": "Successfully logged out", "success" : True}
     
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/email/registration", status_code=status.HTTP_200_OK)
async def register_email(email: str, db: Session = Depends(get_db)):
    # Rate limiting logic here
    
    # Check if a user with this email already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user :
        # Don't reveal that the email is registered, just say a link was sent
        return {"message": "If this email is registered, a magic link has been sent.", "success" : False}
    
    # Check for existing temporary registration
    temp_reg = db.query(TemporaryRegistration).filter(TemporaryRegistration.email == email).first()
    
    if temp_reg:
        # Update existing temporary registration
        if temp_reg.token_expiration <= datetime.utcnow():
            expire = datetime.utcnow() + timedelta(minutes=15)
            token = jwt.encode(dict(sub=email, exp=expire), settings.SECRET_KEY, algorithm=settings.ALGORITHM)
            temp_reg.registration_token = token
            
    else:
        # Create new temporary registration
        expire = datetime.utcnow() + timedelta(minutes=15)
        temp_reg = TemporaryRegistration(
            email=email,
            registration_token=jwt.encode(dict(sub=email, exp=expire), settings.SECRET_KEY, algorithm=settings.ALGORITHM),
            token_expiration=expire
        )
        db.add(temp_reg)
    
    db.commit()
    db.refresh(temp_reg)
    
    # Send magic link
    result = send_magic_link(temp_reg)
    
    return result

@router.post("/user/registration", status_code=status.HTTP_200_OK)
async def register_final(user : UserCreate, user_ptr: User = Depends(get_current_temp_reg), db: Session = Depends(get_db)):

        # Check if username already exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    
    new_user = create_user(
        db=db,
        email=user_ptr.email,
        hashed_password=get_password_hash(user.password),
        username=user.username
    )
    
    if new_user:
        temp_user = db.query(TemporaryRegistration).filter(TemporaryRegistration.email == new_user.email).first()
        if temp_user:
            db.delete(temp_user)
            db.commit()
            logger.info(f"Temporary user deleted for email: {user_ptr.email}")
        else:
            logger.warning(f"No temporary user found for email: {user_ptr.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already registered or not found"
            )
    

    access_token = create_access_token(data={"sub": new_user.email})
    logger.info(f"Login successful for user: {new_user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/user", status_code=status.HTTP_200_OK)
async def get_all_user(db : Session = Depends(get_db)):
   users = db.query(TemporaryRegistration).first()
   if users is not None:
        return users.email
   else:
       return None 
       


