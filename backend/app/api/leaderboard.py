from fastapi import Depends, Query, HTTPException, APIRouter, status
from datetime import datetime, timedelta
import os
import numpy as np
import pandas as pd
import csv, json
from typing import List, Dict
import logging
from app.core.leaderboard import elo_calculation
from app.core.security import get_current_user
import pickle
import pdb

router = APIRouter()
logger = logging.getLogger(__name__)

# There was a bug in gemini battles before Sunday, September 8th 11:40am PST. 
# We remove multi-turn Gemini battles from before this date.
def filter_gemini_bug_september_8(df):
    corrupted_name_indexes = ((df['Time'] < np.datetime64('2024-09-08T11:40:00-07:00')) & (df['Model'].str.contains("gemini")))
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
    folder_for_battles = "./db/json/"
    users = os.listdir(folder_for_battles)
    users = [user for user in users if (user != "anonymous")]

    df = []

    for user in users:
        user_folder = folder_for_battles + user + "/"
        battles = [f for f in os.listdir(user_folder) if ".json" in f]
        if len(battles) == 0:
            continue
        dates = []
        battle_data = []
        for f in battles:
            # try loading the file
            try:
                bt = json.load(open(user_folder + f))
                battle_data.append(bt)
                dates.append(pd.to_datetime(f[:15], format='%Y%m%d_%H%M%S'))
            except Exception as e:
                print(e)
        targets = [b["target_phrase"] for b in battle_data]
        turns = [len(b["chat_history"]) for b in battle_data]
        models = []
        for b in battle_data:
            if isinstance(b["model"], str):
                models.append(b["model"])
            else:
                models.append(b["model"]["name"])
        results = [b["state"].lower() == "win" for b in battle_data]
        players = [user] * len(battle_data)
        df += [pd.DataFrame({"Player": players, "Target": targets, "Model": models, "Result": results, "Time": dates, "Turns": turns})]

    df = pd.concat(df, ignore_index=True)

    # Apply filters
    df = filter_gemini_bug_september_8(df)

    # Remove battles with 0 history
    df = filter_zero_history(df)
    return df

def get_leaderboard_with_delta():
    current_time = datetime.now()
    leaderboard_dir = "./app/data/leaderboards"

    # If the leaderboard directory doesn't exist, create it
    os.makedirs(leaderboard_dir, exist_ok=True)
    
    # Check for existing leaderboard files
    most_recent_file = None
    most_recent_datetime = None
    for filename in os.listdir(leaderboard_dir):
        if filename.endswith(".pkl"):
            file_datetime = datetime.strptime(filename[:-4], "%Y%m%d%H%M%S")
            file_path = os.path.join(leaderboard_dir, filename)
            
            # If file is less than an hour old, return its contents
            if current_time - file_datetime < timedelta(minutes=10):
                with open(file_path, 'rb') as handle:
                    return pickle.load(handle)
            
            # Keep track of the most recent file
            if most_recent_datetime is None or file_datetime > most_recent_datetime:
                most_recent_file = file_path
                most_recent_datetime = file_datetime
    
    # If no recent file found, compute new leaderboard
    df = get_battle_df()

    # Load the most recent leaderboard if it exists
    previous_leaderboard_with_delta = None
    if most_recent_file:
        with open(most_recent_file, 'rb') as handle:
            previous_leaderboard_with_delta = pickle.load(handle)

    leaderboard = elo_calculation(df, 0.1)
    
    # Calculate delta if previous leaderboard exists
    if previous_leaderboard_with_delta is not None:
        delta = {}
        for category in leaderboard.keys():
            delta[category] = {
                item : leaderboard[category][item] - previous_leaderboard_with_delta['delta'][category][item] if item in previous_leaderboard_with_delta['delta'][category].keys() else 0 for item in leaderboard[category]
            }
    else:
        delta = {category: {player: 0 for player in leaderboard[category]} for category in leaderboard}

    leaderboard_with_delta = {"leaderboard": leaderboard, "delta": delta}
    
    # Save new leaderboard
    new_filename = current_time.strftime("%Y%m%d%H%M%S") + ".pkl"
    new_file_path = os.path.join(leaderboard_dir, new_filename)
    with open(new_file_path, 'wb') as handle:
        pickle.dump(leaderboard_with_delta, handle, protocol=pickle.HIGHEST_PROTOCOL)

    return leaderboard_with_delta

@router.get("/")
async def get_leaderboard():
    return get_leaderboard_with_delta()

@router.get("/me")
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