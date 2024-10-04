import uuid
import pytest
import os
import sys
from fastapi.testclient import TestClient
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.join(os.path.abspath(os.path.dirname(__file__)), "..", ".."))

from app.main import app
from app.core.utils import DB_DIR
from app.database import Base, get_db

# Define a test database in memory
SQLALCHEMY_DATABASE_URL = "sqlite:///test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency for tests
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Apply the dependency overrides to the app
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    # Create the test database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop the tables after the test
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

@pytest.fixture(scope="function")
def context():
    """Fixture to provide the test client and store created usernames for cleanup."""
    created_usernames = []

    def create_user(username, password):
        """Helper function to create a user and track the username, checking if the response is successful."""
        response = client.post("/api/register", json={"username": username, "password": password})
        if response.status_code == 201:
            created_usernames.append(username)
        return response

    def cleanup_users():
        """Helper function to delete all users created during the test."""
        for username in created_usernames:
            shutil.rmtree(os.path.join(DB_DIR, username))

    yield client, create_user, cleanup_users

    # Teardown logic: clean up created users after each test
    cleanup_users()

def test_register_valid(context):
    _, create_user, _ = context
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    
    response = create_user(username, "validpass123!")
    assert response.status_code == 201
    assert response.json() == {"message": "User created successfully"}

def test_register_invalid_password(context):
    _, create_user, _ = context
    username = f"testuser_{uuid.uuid4().hex[:8]}"

    response = create_user(username, "short")
    assert response.status_code == 422  # Unprocessable Entity
    assert "Password must be at least 8 characters long" in response.text

def test_login(context):
    client, create_user, _ = context
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    
    # First, register a user
    create_user(username, "validpass123")

    # Now, try to login
    response = client.post("/api/login", data={"username": username, "password": "validpass123"})
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_invalid_password(context):
    client, create_user, _ = context
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    
    # First, register a user
    create_user(username, "validpass123")

    # Now, try to login with incorrect password
    response = client.post("/api/login", data={"username": username, "password": "wrongpass123"})
    assert response.status_code == 401
    assert "Incorrect password" in response.text


def test_game_creation_forfeit(context):
    client, create_user, _ = context
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    
    # First, register a user
    response = create_user(username, "validpass123!")
    try:
        response = client.post("/api/login", data={"username": username, "password": "validpass123!"})
        response = response.json()
    except Exception as e:
        pytest.fail("...")
    print(response)
    # Now, try to login with incorrect password
    token = response["access_token"]
    headers = {"Authorization" : f"Bearer {token}"}
    response = client.post("/api/game/create",
                           headers=headers)
    game = response.json()

    assert "session_id" in game
    assert "target_phrase" in game
    assert "model" in game
    assert response.status_code == 200
    
    response = client.post(
        f"/api/game/forfeit?session_id={game["session_id"]}&username={token}"
    )
    print(response.json())
    assert response.status_code == 200
    

def test_game_creation_write_session(context):
    client, create_user, _ = context
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    
    # First, register a user
    response = create_user(username, "validpass123!")
    try:
        response = client.post("/api/login", data={"username": username, "password": "validpass123!"})
        response = response.json()
    except Exception as e:
        pytest.fail("...")
    print(response)
    # Now, try to login with incorrect password
    token = response["access_token"]
    headers = {"Authorization" : f"Bearer {token}"}
    response = client.post("/api/game/create",
                           headers=headers)
    game = response.json()

    assert "session_id" in game
    assert "target_phrase" in game
    assert "model" in game
    assert response.status_code == 200
    
    response = client.post(
        f"/api/game/write_session?session_id={game["session_id"]}",
        headers=headers
    )
    assert response.status_code == 200
