# Alembic Database Migrations

This project uses Alembic for managing database migrations. The database includes tables for game sessions, leaderboards, and leaderboard entries.

## Project Structure

```
/
├── alembic/
│   ├── versions/
│   │   └── 3c828c92ed0c_initial_commit.py
│   ├── env.py
│   └── script.py.mako
├── backend/app/database.py
├── alembic.ini
└── README.md
```

## Database Schema

The database schema includes the following tables:

1. `game_sessions`: Stores information about game sessions.
2. `leaderboards`: Stores leaderboard information.
3. `leaderboard_entries`: Stores individual entries for leaderboards.

## Getting Started

1. Install the required dependencies:

   ```
   pip install -r requirements.txt 
   // or 
   pip install alembic sqlalchemy
   ```

2. Initialize the database:

   ```
   alembic upgrade head
   ```

## Managing Migrations

### Create a new migration

To create a new migration, use the following command:

```
alembic revision -m "Description of the changes"
```

This will create a new file in the `alembic/versions/` directory.

### Apply migrations

To apply all pending migrations:

```
alembic upgrade head
```

To apply a specific migration:

```
alembic upgrade <revision_id>
```

### Revert migrations

To revert the last migration:

```
alembic downgrade -1
```

To revert to a specific migration:

```
alembic downgrade <revision_id>
```

## Models

The project uses SQLAlchemy ORM for defining database models. The main models are:

- `GameSession`: Represents a game session with attributes like session_id, username, state, target_phrase, etc.
- `Leaderboard`: Represents a leaderboard with a timestamp.
- `LeaderboardEntry`: Represents an entry in a leaderboard with category, item, score, and delta.

For more details on the models and their relationships, refer to the `models.py` file.

## Configuration

The database configuration is stored in the `alembic.ini` file. Make sure to update the `sqlalchemy.url` value if you need to change the database connection details.

## Troubleshooting

If you encounter any issues with migrations or database operations, check the following:

1. Ensure that your database URL in `alembic.ini` is correct.
2. Verify that all required packages are installed.
3. Check the Alembic documentation for specific error messages.

For more information on using Alembic, refer to the [official Alembic documentation](https://alembic.sqlalchemy.org/).