from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from routers import auth


app = FastAPI(title="API Arcieri Vicenza")

app.include_router(auth.router)

# Permette al frontend (porta 8080) di dialogare con il backend (porta 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Il backend di ProgettoArcieri con FastAPI funziona!"}