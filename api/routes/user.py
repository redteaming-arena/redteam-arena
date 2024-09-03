from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from api.core.security import get_current_user
from api.database import get_db, User, TemporaryRegistration
from dotenv import load_dotenv
import logging
import base64

load_dotenv()
router = APIRouter()
logger = logging.getLogger(__name__)

def delete_user_by_username(db: Session, username: str) -> bool:
    try:
        user = db.query(User).filter(User.username == username).one()

        db.delete(user)
        db.commit()

        return True
    except NoResultFound:
        return False
    except Exception as e:
        db.rollback()
        raise e

@router.get("/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get the initial of the username
    initial = current_user.username[0].upper() if current_user.username else ''
    
    # Convert binary identicon to base64 string
    identicon_base64 = f"data:image/png;base64, {base64.b64encode(current_user.identicon).decode('utf-8') if current_user.identicon else None}"
    
    return JSONResponse({
        "initial": initial,
        "identicon": identicon_base64,
        "email" : current_user.email,
        "score" : current_user.score,
        "username" : current_user.username,
        "role" : str(current_user.role)
    })
    
@router.get("/icon/{username}")
async def get_user_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")  

    return Response(content=user.identicon, media_type="image/png")
    
@router.delete("/")
async def delete_user_account(
    username: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if the username belongs to the current user
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized to delete this account")
    
    # Perform the delete operation
    success = delete_user_by_username(db, username)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"detail": "User account successfully deleted"}


@router.delete("/all")
async def delete_all_user_account(
    db: Session = Depends(get_db)
):
    
    # Check if the username belongs to the current user
    for user in db.query(User).all():
    # Perform the delete operation
        print(user)
        success = delete_user_by_username(db, user.username)
        print(success)
    
    return {"detail": "User account successfully deleted"}


@router.delete("/all/temp")
async def delete_all_tempuser_account(
    db: Session = Depends(get_db)
):
    
    # Check if the username belongs to the current user
    for user in db.query(TemporaryRegistration).all():
    # Perform the delete operation
        print(user)
        success = delete_user_by_username(db, user.username)
        print(success)
    
    return {"detail": "User account successfully deleted"}
