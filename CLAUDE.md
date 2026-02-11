# CLAUDE.md - AI Assistant Guide for RedTeam Arena

## Project Overview

RedTeam Arena is a competitive red-teaming platform where users attempt to make AI models say specific target phrases within a 60-second time limit. The primary game is "Bad Words" — players are matched against a randomly sampled AI model and ranked on an ELO leaderboard. Production site: https://redarena.ai

## Architecture

**Monorepo** with two main components:

- **`backend/`** — Python FastAPI REST API with SQLite database
- **`web/`** — React 18 single-page application (Create React App)

```
redteam-arena/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point, CORS, router registration
│   │   ├── database.py          # SQLAlchemy models (GameSession, Leaderboard, LeaderboardEntry)
│   │   ├── api/                 # Route handlers
│   │   │   ├── auth.py          # POST /api/register, /api/login
│   │   │   ├── games.py         # /api/game/* — create, chat (SSE), forfeit, share, history
│   │   │   ├── leaderboard.py   # /api/leaderboard/*
│   │   │   ├── users.py         # /api/user/*
│   │   │   └── targetPhraseList.py  # Target phrase data and weights
│   │   ├── core/                # Business logic and config
│   │   │   ├── config.py        # Pydantic Settings (env-based)
│   │   │   ├── security.py      # JWT auth, password hashing (bcrypt)
│   │   │   ├── leaderboard.py   # ELO rating calculation (online logistic regression)
│   │   │   └── utils.py         # JSON/text file I/O helpers
│   │   ├── ai_models/           # LLM provider integrations
│   │   │   ├── base.py          # ClientProtocol interface
│   │   │   ├── openai_model.py  # OpenAI + Fireworks (OpenAI-compatible)
│   │   │   ├── anthropic_model.py
│   │   │   ├── gemini_model.py
│   │   │   └── __init__.py      # AIModelSampler — random provider/model selection
│   │   └── schemas/             # Pydantic request/response models
│   ├── test/
│   │   └── main.py              # pytest test suite
│   └── requirements.txt
├── web/
│   ├── src/
│   │   ├── index.js             # React entry point
│   │   ├── App.js               # React Router config
│   │   ├── pages/               # Full-page route components (Home, History, Leaderboard, Profile, Terms)
│   │   ├── components/          # Reusable components (ChatbotPage, LoginPage, LeaderboardPage, etc.)
│   │   │   └── ui/              # Radix UI primitives (button, input, card, table, etc.)
│   │   ├── services/
│   │   │   ├── api.js           # Backend API client (fetch-based, SSE streaming)
│   │   │   └── auth.js          # JWT token management via cookies
│   │   └── lib/utils.js         # Utility functions (cn for classnames)
│   ├── package.json
│   ├── tailwind.config.js
│   └── .prettierrc
├── alembic/                     # Database migration scripts
├── alembic.ini                  # Alembic config (SQLite: sql_redarena.db)
├── Dockerfile                   # Ubuntu 22.04 base, builds frontend + backend
├── Makefile                     # Docker orchestration commands
└── .github/workflows/backend.yml  # CI: pytest on push/PR to main
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.3, React Router DOM 6.26, JavaScript (no TypeScript) |
| Styling | Tailwind CSS 3.4, Radix UI components, Lucide icons |
| Backend | FastAPI, Uvicorn, Python 3 |
| Database | SQLite via SQLAlchemy ORM |
| Migrations | Alembic |
| Auth | JWT (HS256) with bcrypt password hashing |
| AI Providers | OpenAI, Anthropic, Google Gemini, Fireworks (Llama) |
| Package Manager | pnpm (frontend), pip (backend) |
| Testing | pytest (backend), Jest + React Testing Library (frontend) |
| CI/CD | GitHub Actions (backend tests on push/PR to main) |
| Containerization | Docker + Make |

## Development Setup

### Frontend

```bash
cd web
npm install     # or pnpm install
npm run start   # starts on http://localhost:3000
```

### Backend

```bash
cd backend
pip install -r requirements.txt
export ENV=DEV  # enables /docs endpoint and wildcard CORS
uvicorn app.main:app --reload  # starts on http://localhost:8000
```

### Database

Follow the Alembic setup in `alembic/README.md`, then:
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Docker (alternative)

```bash
make build      # build Docker image
make up         # run container (ports 8000, 3000)
make web        # start frontend in container
make backend    # start backend in container
make enter      # interactive shell in container
make down       # stop and remove container
make clean      # remove __pycache__ and .pytest_cache
```

### Environment Variables

**Backend** (`backend/config.env` or env vars):
- `SECRET_KEY` — JWT signing key (required)
- `ENV` — set to `DEV` for development mode (enables docs, wildcard CORS)
- `OPENAI_API_KEY` — OpenAI API key
- `ANTHROPIC_API_KEY` — Anthropic API key
- `GEMINI_API_KEY` — Google Gemini API key
- `FIREWORKS_API_KEY` — Fireworks API key

**Frontend** (`web/config.env` or env vars):
- `REACT_APP_BACKEND_URL` — backend URL (default: `http://localhost:8000`)
- `REACT_APP_BUILD` — build environment
- `REACT_APP_SECRET_KEY` — JWT secret for client-side token validation
- `REACT_APP_DEV_LOGIN_TOKEN` — dev fallback token

## Running Tests

### Backend
```bash
pytest backend/test/main.py -v
```

### Frontend
```bash
cd web
npm test
```

## Key Conventions

### Backend
- **Route organization**: One file per domain in `backend/app/api/`, registered as FastAPI routers in `main.py` with prefixes (`/api`, `/api/game`, `/api/leaderboard`, `/api/user`)
- **Auth pattern**: `get_current_user()` dependency injection for protected endpoints (defined in `core/security.py`)
- **AI model abstraction**: All providers implement `ClientProtocol` from `ai_models/base.py`. The `AIModelSampler` singleton in `ai_models/__init__.py` handles random selection
- **Game streaming**: Chat responses use Server-Sent Events (SSE) via `StreamingResponse`
- **Background tasks**: FastAPI `BackgroundTasks` for async game session persistence
- **Hybrid storage**: SQLite for game sessions + filesystem (`db/json/`) for user data and game history JSON files
- **ELO system**: Online logistic regression in `core/leaderboard.py`, tracking player skill, phrase difficulty, and model strength

### Frontend
- **Routing**: Defined in `App.js` using React Router DOM v6
- **State management**: React hooks only (`useState`, `useEffect`, `useRef`) — no Redux or Context API. `Home.js` is the main game flow orchestrator
- **API calls**: Centralized in `services/api.js` using fetch (not Axios for API calls despite Axios being a dependency)
- **Auth tokens**: Stored in cookies via `js-cookie`, managed through `services/auth.js`
- **SSE streaming**: Uses `@microsoft/fetch-event-source` for real-time chat responses
- **Component structure**: Pages in `pages/`, reusable components in `components/`, Radix UI primitives in `components/ui/`

### Code Style
- **Frontend**: Prettier enforced — semicolons, double quotes, 2-space tabs, trailing commas (ES5), LF line endings, no parens on single arrow params
- **Frontend linting**: ESLint with `react-app` preset (configured in `package.json`)
- **Backend**: Standard Python conventions, no explicit formatter configured
- **Naming**: camelCase for JavaScript, snake_case for Python

### Database
- **Engine**: SQLite at project root (`sql_redarena.db`)
- **Models**: `GameSession`, `Leaderboard`, `LeaderboardEntry` in `backend/app/database.py`
- **Game states**: `WIN`, `LOSS`, `PLAYING`, `FORFEIT` (enum)
- **Session pattern**: `get_db()` generator yields SQLAlchemy sessions with try/finally cleanup

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register` | Create user account |
| POST | `/api/login` | Login (OAuth2PasswordRequestForm) |
| POST | `/api/game/create` | Start new game session |
| POST | `/api/game/chat` | Stream chat with AI (SSE) |
| POST | `/api/game/forfeit` | Forfeit active game |
| POST | `/api/game/write_session` | Persist game state (background) |
| POST | `/api/game/share/{session_id}` | Toggle session sharing |
| GET | `/api/game/share/{session_id}` | Get shared session (public) |
| GET | `/api/game/history` | User's game history |
| GET | `/api/game/history/{session_id}` | Specific game details |
| GET | `/api/leaderboard/get_leaderboard` | Global rankings |
| GET | `/api/leaderboard/get_leaderboard/me` | User's ranking |
| GET | `/api/user/me` | Current user info |
| GET | `/api/user/profile` | User profile with stats |

## CI/CD

GitHub Actions workflow (`.github/workflows/backend.yml`):
- Triggers on push and PR to `main`
- Sets up Python 3.x, installs backend dependencies
- Runs `pytest backend/test/main.py -v`
- Injects API keys and secrets from GitHub Secrets

## Important Files

- `backend/app/main.py` — Backend application setup and router registration
- `backend/app/database.py` — All SQLAlchemy ORM models
- `backend/app/api/games.py` — Core game logic (largest API file)
- `backend/app/ai_models/__init__.py` — AI model configuration and sampling
- `backend/app/core/security.py` — JWT auth implementation
- `backend/app/core/leaderboard.py` — ELO rating algorithm
- `web/src/pages/Home.js` — Main game flow orchestrator (frontend)
- `web/src/services/api.js` — All backend API calls (frontend)
- `web/src/components/ChatbotPage.js` — Real-time chat interface

## Gotchas

- The frontend uses JavaScript only (no TypeScript) despite being a React project
- User passwords are stored in the filesystem (`db/json/{username}/hashed_password.txt`), not in SQLite
- The Fireworks provider reuses the `OpenAIClient` with a custom `base_url`
- `ENV=DEV` must be set for the backend `/docs` (Swagger UI) endpoint to be available
- The `.gitignore` excludes `alembic/versions/`, `backend/app/data/`, and `sql_redarena.db`
- Leaderboard calculations are cached as pickle files with a 10-minute TTL in `backend/app/data/leaderboards/`
