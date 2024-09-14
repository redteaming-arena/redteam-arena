import os
import json

DB_DIR="db/json/"

def load_json(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return {}

def save_json(file_path, data):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

def load_txt(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return f.read().strip()
    return None

def save_txt(file_path, data):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        f.write(data)