from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from api.routes.game import router as games
from api.routes.auth import router as auth
from api.routes.user import router as user
from api.routes.blue_team import router as blueTeam
from api.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def hello_world():
    return {"message": "Hello World"}



app.include_router(auth, prefix="/api", tags=["auth"])
app.include_router(games, prefix="/api/game", tags=["game"])
app.include_router(user, prefix="/api/user", tags=["user"])
app.include_router(blueTeam, prefix="/api/blueteam", tags=["blueteam"])