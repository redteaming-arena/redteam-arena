# app/api/users.py

import json
import logging
import os

from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.schemas.user import User
from app.api.leaderboard import get_battle_df
from app.core.leaderboard import elo_calculation, get_elo_by_player

router = APIRouter()
logger = logging.getLogger(__name__)

STEP_SIZE = 0.1

@router.get("/", response_model=dict)
async def get_user_profile(
    current_user: dict = Depends(get_current_user)
):
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
            "username" : current_user
        }

    # Next handle normal case
    logger.info(f"{current_user} searches history")
    folder_name = f"db/json/{current_user}"
    if not os.path.exists(folder_name):
        raise HTTPException(status_code=404, detail="No data found for this user")

    try:
        df = get_battle_df()
        all_elo_ratings = elo_calculation(df, STEP_SIZE)
        elo_rating = get_elo_by_player(all_elo_ratings, current_user)
        players = list(all_elo_ratings['players'].keys())
        scores = list(all_elo_ratings['players'].values())
        sorted_combined = sorted(list(zip(players, scores)), key=lambda x: x[1], reverse=True)

        completed_sessions = []
        rank = sorted_combined.index((current_user, elo_rating)) + 1
        for dirpath, dirnames, filenames in os.walk(folder_name):
            for filename in filenames:
                if filename.endswith(".json"):
                    file_path = os.path.join(dirpath, filename)
                    with open(file_path, "r") as file:
                        session_data = json.load(file)
                        # Check if the game is completed (not ongoing)
                        if session_data["state"] != "ongoing":
                            completed_sessions.append({
                                "session_id": session_data["session_id"],
                                "target_phrase": session_data["target_phrase"],
                                "state": session_data["state"],
                                "shared" : session_data.get("share", False)
                            })
    except ValueError as e:
        return {
            "elo_rating" : elo_rating,
            "global_rank": "NaN",
            "games_played": len(completed_sessions),
            "games_won": len([s for s in completed_sessions if s["state"] == "win"]),
            "games_lost": len([s for s in completed_sessions if s["state"] == "loss"]),
            "completed_sessions": completed_sessions,
            "username" : current_user
        }
        
    user_profile = {
        "elo_rating": elo_rating,
        "global_rank": rank,
        "games_played": len(completed_sessions),
        "games_won": len([s for s in completed_sessions if s["state"] == "win"]),
        "games_lost": len([s for s in completed_sessions if s["state"] == "loss"]),
        "completed_sessions": completed_sessions,
        "username" : current_user
    }
    return user_profile
