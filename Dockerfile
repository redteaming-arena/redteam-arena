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
COPY ./backend /app/backend
WORKDIR /app/backend
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# IMPORT EVERYTHING ELSE
WORKDIR /app/backend
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]