from pydantic import BaseModel



from fastapi import APIRouter, HTTPException, status
from jose import jwt
import bcrypt
from datetime import datetime, timedelta
import os

router = APIRouter(prefix="/auth", tags=["auth"])


SECRET_KEY = os.getenv("SECRET_KEY", "segnaposto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class LoginInput(BaseModel):
    email : str
    password : str

class TokenOutput(BaseModel):
    access_token: str
    token_type : str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login", response_model=TokenOutput)
def login(data: LoginInput):
    # Per ora utente finto, poi lo leggeremo dal database
    fake_user = {
        "email": "test@test.it",
        "password_hash": bcrypt.hashpw(b"password123", bcrypt.gensalt())
    }

    if data.email != fake_user["email"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenziali non valide"
        )

    if not bcrypt.checkpw(data.password.encode(), fake_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenziali non valide"
        )

    token = create_access_token({"sub": data.email})
    return TokenOutput(access_token=token, token_type="bearer")