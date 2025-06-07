import os
import firebase_admin
from firebase_admin import credentials, firestore

cred_path = os.getenv("FIREBASE_CREDENTIAL_PATH")

if cred_path and os.path.exists(cred_path):
    # Local dev — using service account file
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    # Production — use GCP service account
    firebase_admin.initialize_app()

db = firestore.client()