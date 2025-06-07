# app/api/users.py

import logging

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.user import User
from app.api.leaderboard import get_battle_df
from app.core.leaderboard import elo_calculation, get_elo_by_player
from google.cloud import firestore
from app.core.firestore import db  # Firestore client

router = APIRouter()
logger = logging.getLogger(__name__)

STEP_SIZE = 0.1

@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return User(username=current_user, is_active=True)

@router.get("/profile", response_model=dict)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Retrieve the profile for the current user
    elo rating, number of games played, number of games won, number of games lost
    """

    # First handle anonymous
    if current_user == "anonymous":
        return {
            "elo_rating": 1000,
            "global_rank": 0,
            "games_played": 0,
            "games_won": 0,
            "games_lost": 0,
            "completed_sessions": [],
            "username": current_user
        }

    logger.info(f"{current_user} fetches profile from Firestore")

    # Pull completed sessions from both 'badwords' and 'norefund'
    def fetch_completed_sessions(collection_name):
        query = db.collection(collection_name).where("username", "==", current_user).where("state", "!=", "ongoing")
        return [
            {
                "session_id": doc.id,
                "target_phrase": doc.to_dict().get("target_phrase", ""),
                "state": doc.to_dict().get("state"),
                "shared": doc.to_dict().get("share", False)
            }
            for doc in query.stream()
        ]

    badwords_sessions = fetch_completed_sessions("badwords")
    norefund_sessions = fetch_completed_sessions("norefund")

    all_sessions = badwords_sessions + norefund_sessions

    df = get_battle_df()
    all_elo_ratings = elo_calculation(df, STEP_SIZE)
    elo_rating = get_elo_by_player(all_elo_ratings, current_user)

    try:
        players = list(all_elo_ratings['players'].keys())
        scores = list(all_elo_ratings['players'].values())
        sorted_combined = sorted(zip(players, scores), key=lambda x: x[1], reverse=True)
        rank = sorted_combined.index((current_user, elo_rating)) + 1

        user_profile = {
            "elo_rating": elo_rating,
            "global_rank": rank,
            "games_played": len(all_sessions),
            "games_won": len([s for s in all_sessions if s["state"] == "win"]),
            "games_lost": len([s for s in all_sessions if s["state"] == "loss"]),
            "badwords_sessions": badwords_sessions,
            "norefund_sessions": norefund_sessions,
            "username": current_user
        }
        return user_profile
    except ValueError:
        return {
            "elo_rating": 0,
            "global_rank": -1,
            "games_played": 0,
            "games_won": 0,
            "games_lost": 0,
            "badwords_sessions": [],
            "norefund_sessions": [],
            "username": current_user
        }
