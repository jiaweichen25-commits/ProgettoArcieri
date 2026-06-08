from datetime import datetime, timedelta
from jose import jwt
import bcrypt
from fastapi import HTTPException, status
from config.settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from repositories import user_repository

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(email: str, password: str):
    user = user_repository.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")
    
    # user[0] is passwd_hash, user[1] is Ruolo
    if not bcrypt.checkpw(password.encode(), user[0].encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")
        
    token = create_access_token({"sub": email, "ruolo": user[1]})
    return token

def register_user(email: str, password: str, ruolo: str):
    existing_user = user_repository.get_user_by_email(email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email già registrata")
        
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_repository.create_user(email, hashed, ruolo)
    
    token = create_access_token({"sub": email, "ruolo": ruolo})
    return token
