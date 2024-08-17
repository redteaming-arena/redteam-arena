# redteam-arena


## Installation

build the docker image
```
docker build -t redteam-arena .
```

run the docker container
```
docker run -d -p 8000:8000 -p 3000:3000 redteam-arena
```

run the backend 
```
docker exec redteam uvicorn app.main:app --reload
```


run the frontend
```
docker exec redteam npm start --prefix frontend
```


tear down the container
```
docker stop redteam
docker rm redteam
```



