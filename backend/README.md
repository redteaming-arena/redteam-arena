## How to run the app

1. Install the dependencies
```bash
pip install -r requirements.txt
```

2. Run the backend
```bash
uvicorn app.main:app --reload
```

3. Backend docs will be available at http://localhost:8000/docs


### How to run test

After you install the dependencies run pytest

```bash
pytest test/main.py -v
```



