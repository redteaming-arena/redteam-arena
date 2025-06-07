# THE GENERAL CONTAINER FOR CONNECTING ALL THE ENVIRONMENTS 😈
FROM ubuntu:22.04

#SYSTEM
ARG DEBIAN_FRONTEND=noninteractive
RUN usermod -s /bin/bash root
RUN apt-get update 

#FRONTEND (NODE)
RUN apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs
COPY ./web /app/web
WORKDIR /app/web
RUN npm install
RUN npm run build

#BACKEND (PYTHON)
RUN apt-get install -y python3 python3-pip
COPY alembic.ini /app/alembic.ini
COPY ./backend /app/backend
COPY ./alembic /app/alembic
WORKDIR /app/backend
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# IMPORT EVERYTHING ELSE
WORKDIR /app
ENV PYTHONPATH=/app/backend
CMD ["sh", "-c", "alembic upgrade head && uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT"]