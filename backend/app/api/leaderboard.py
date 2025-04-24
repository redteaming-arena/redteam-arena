from fastapi import Depends, Query, HTTPException, APIRouter, status
from datetime import datetime, timedelta
import os
import numpy as np
import pandas as pd
import csv, json
from typing import List, Dict
import logging
from app.core.leaderboard import elo_calculation_badwords, elo_calculation_norefund
from app.core.security import get_current_user
import pickle
import pdb
from app.core.firestore import db

router = APIRouter()
logger = logging.getLogger(__name__)

# There was a bug in gemini battles before Sunday, September 8th 11:40am PST. 
# We remove multi-turn Gemini battles from before this date.
def filter_gemini_bug_september_8(df):
    # Use a tz-aware UTC datetime for comparison to avoid tz-naive/tz-aware errors
    comparison_time = pd.Timestamp("2024-09-08T18:40:00", tz="UTC")
    corrupted_name_indexes = ((df['Time'] < comparison_time) & (df['Model'].str.contains("gemini")))
    # If the date is before September 8th 11:40am PST, delete battle if the model contains "gemini"
    corrupted_vote_indexes = (corrupted_name_indexes & (df["Turns"] > 2))
    df.loc[corrupted_name_indexes,'Model'] = "gemini-1.0-pro"
    df = df[~corrupted_vote_indexes]
    return df

def filter_zero_history(df):
    # Remove battles with 0 history
    df = df[df["Turns"] > 0]
    return df

def get_battle_df():
    all_sessions = []

    for collection_name in ["badwords", "norefund"]:
        # Only fetch sessions where state != "ongoing"
        sessions = db.collection(collection_name).stream()

        for doc in sessions:
            data = doc.to_dict()
            username = data.get("username", "anonymous")
            if username == "anonymous":
                continue
            state = data.get("state", "")
            if state == "ongoing":
                continue

            model = data.get("model")
            target = data.get("target_phrase", "")  # norefund might not have it
            turns = len(data.get("history", []))
            result = state.lower() == "win"
            timestamp = data.get("created_at")
            # Try to parse timestamp to pandas datetime if it's str
            if isinstance(timestamp, str):
                try:
                    timestamp = pd.to_datetime(timestamp)
                except Exception:
                    pass

            all_sessions.append({
                "Player": username,
                "Target": target,
                "Model": model,
                "Result": result,
                "Time": timestamp,
                "Turns": turns
            })

    if not all_sessions:
        return pd.DataFrame()

    df = pd.DataFrame(all_sessions)

    # Apply filters
    df = filter_gemini_bug_september_8(df)
    df = filter_zero_history(df)

    return df

# Only process the "badwords" collection
def get_badwords_battle_df():
    all_sessions = []

    sessions = db.collection("badwords").stream()
    for doc in sessions:
        data = doc.to_dict()
        username = data.get("username", "anonymous")
        if username == "anonymous":
            continue
        state = data.get("state", "")
        if state == "ongoing":
            continue

        model = data.get("model")
        target = data.get("target_phrase", "")
        turns = len(data.get("history", []))
        result = state.lower() == "win"
        timestamp = data.get("created_at")
        if isinstance(timestamp, str):
            try:
                timestamp = pd.to_datetime(timestamp)
            except Exception:
                pass

        all_sessions.append({
            "Player": username,
            "Target": target,
            "Model": model,
            "Result": result,
            "Time": timestamp,
            "Turns": turns
        })

    if not all_sessions:
        return pd.DataFrame()

    df = pd.DataFrame(all_sessions)
    df = filter_gemini_bug_september_8(df)
    df = filter_zero_history(df)
    return df

# Only process the "norefund" collection
def get_norefund_battle_df():
    all_sessions = []

    sessions = db.collection("norefund").stream()
    for doc in sessions:
        data = doc.to_dict()
        username = data.get("username", "anonymous")
        if username == "anonymous":
            continue
        state = data.get("state", "")
        if state == "ongoing":
            continue

        model = data.get("model")
        scenario_name = data.get("scenario_name", "")
        turns = len(data.get("history", []))
        result = state.lower() == "win"
        timestamp = data.get("created_at")
        if isinstance(timestamp, str):
            try:
                timestamp = pd.to_datetime(timestamp)
            except Exception:
                pass

        all_sessions.append({
            "Player": username,
            "Scenario": scenario_name,
            "Model": model,
            "Result": result,
            "Time": timestamp,
            "Turns": turns
        })

    if not all_sessions:
        return pd.DataFrame()

    df = pd.DataFrame(all_sessions)
    df = filter_gemini_bug_september_8(df)
    df = filter_zero_history(df)
    return df

def get_leaderboard_with_delta():
    # Compute leaderboards separately for badwords and norefund
    df_badwords = get_badwords_battle_df()
    df_norefund = get_norefund_battle_df()

    if df_badwords.empty:
        leaderboard_badwords = {"players": {}}
        delta_badwords = {"players": {}}
    else:
        leaderboard_badwords = elo_calculation_badwords(df_badwords, 0.1)
        delta_badwords = {
            category: {player: 0 for player in leaderboard_badwords[category]}
            for category in leaderboard_badwords
        }

    if df_norefund.empty:
        leaderboard_norefund = {"players": {}}
        delta_norefund = {"players": {}}
    else:
        leaderboard_norefund = elo_calculation_norefund(df_norefund, 0.1)
        delta_norefund = {
            category: {player: 0 for player in leaderboard_norefund[category]}
            for category in leaderboard_norefund
        }

    return {
        "badwords": {
            "leaderboard": leaderboard_badwords,
            "delta": delta_badwords
        },
        "norefund": {
            "leaderboard": leaderboard_norefund,
            "delta": delta_norefund
        }
    }

@router.get("/get_leaderboard")
async def get_leaderboard():
    return get_leaderboard_with_delta()

@router.get("/get_leaderboard/me")
async def get_leaderboard(
    current_player: dict = Depends(get_current_user),
    top_n: int = Query(10, description="Number of top players to return"),
    around_n: int = Query(5, description="Number of players to show around the current user")
):
    leaderboard_with_delta = get_leaderboard_with_delta()

    # Sort players by score in descending order
    players = list(leaderboard_with_delta['leaderboard']['players'].keys())
    scores = list(leaderboard_with_delta['leaderboard']['players'].values())
    sorted_combined = sorted(list(zip(players, scores)), key=lambda x: x[1], reverse=True)
    
    # Get top N users
    top_users = [
        {"position": i+1, "username": username, "score": score}
        for i, (username, score) in enumerate(sorted_combined[:top_n])
    ]

    if current_player == "anonymous":
        return {
            "username"  : "anonymous",
            "user_position": None,
            "user_score": None,
            "total_users": len(sorted_combined),
            "top_users": top_users,
            "around_users": []
        }

    else:
        if current_player not in players:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Current user not found in leaderboard")

        # Find current user's position
        user_position = next((index for index, (username, _) in enumerate(sorted_combined) if username == current_player), -1)
        
    # Get users around the current user
    start = max(0, user_position - around_n // 2)
    end = min(len(sorted_combined), start + around_n)
    around_users = [
        {"position": start+i+1, "username": username, "score": score}
        for i, (username, score) in enumerate(sorted_combined[start:end])
    ]
    
    return {
        "username"  : current_player,
        "user_position": user_position + 1,
        "user_score": sorted_combined[user_position][1],
        "total_users": len(sorted_combined),
        "top_users": top_users,
        "around_users": around_users
    }