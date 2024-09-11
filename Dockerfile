# THE GENERAL CONTAINER FOR CONNECTING ALL THE ENVIRONMENTS 😈
FROM ubuntu:22.04

#SYSTEM
ARG DEBIAN_FRONTEND=noninteractive
RUN usermod -s /bin/bash root
RUN apt-get update 

#FRONTEND (NODE)
RUN apt-get install -y nodejs npm
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

WORKDIR /app

# IMPORT EVERYTHING ELSE
ENTRYPOINT [ "tail", "-f", "/dev/null"]