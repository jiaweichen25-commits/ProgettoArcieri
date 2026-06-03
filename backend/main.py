from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import psycopg2
from dotenv import load_dotenv
from routers import auth

load_dotenv()

app = FastAPI(title="API Arcieri Vicenza")

app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    try:
        yield conn
    finally:
        conn.close()

@app.get("/")
def read_root():
    return {"message": "Il backend di ProgettoArcieri con FastAPI funziona!"}