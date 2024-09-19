
IMAGE_NAME=redteam
up:
	docker run -d -p 8000:8000 -p 3000:3000 -v ./:/app --name $(IMAGE_NAME) $(IMAGE_NAME)

web:
	docker exec redteam npm run start --prefix /app/web
backend:
	docker exec redteam bash -c "uvicorn main:app --reload" --prefix /app/backend
build:
	docker build -t $(IMAGE_NAME) .
down:
	docker stop $(IMAGE_NAME)
	docker rm $(IMAGE_NAME)
enter:
	docker exec -it $(IMAGE_NAME) /bin/bash

db:
	alembic revision --autogenerate -m "Add GameSession" && alembic upgrade head