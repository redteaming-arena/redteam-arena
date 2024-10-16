import uvicorn
from dotenv import load_dotenv

from routes.index import app
from database import engine, Base

# load .env
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    