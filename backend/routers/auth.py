

from fastapi import APIRouter, HTTPException, status
from jose import jwt
import bcrypt
from datetime import datetime, timedelta
import os
from pydantic import BaseModel, EmailStr, field_validator
import psycopg2
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db_conn():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

SECRET_KEY = os.getenv("SECRET_KEY", "segnaposto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class LoginInput(BaseModel):
    email : str
    password : str

class TokenOutput(BaseModel):
    access_token: str
    token_type : str

class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    ruolo: str

    @field_validator("ruolo")
    @classmethod
    def ruolo_valido(cls, v):
        if v not in ("atleta", "istruttore"):
            raise ValueError("Ruolo deve essere 'atleta' o 'istruttore'")
        return v

    @field_validator("password")
    @classmethod
    def password_lunghezza(cls, v):
        if len(v) < 6:
            raise ValueError("La password deve essere di almeno 6 caratteri")
        return v
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login", response_model=TokenOutput)
def login(data: LoginInput):
    conn = get_db_conn()
    cur = conn.cursor()
    
    cur.execute('SELECT "passwd_hash", "Ruolo" FROM "Tutenti" WHERE "E-mail" = %s', (data.email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")

    if not bcrypt.checkpw(data.password.encode(), user[0].encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")

    token = create_access_token({"sub": data.email, "ruolo": user[1]})
    return TokenOutput(access_token=token, token_type="bearer")

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterInput):
    conn = get_db_conn()
    cur = conn.cursor()

    cur.execute('SELECT "IDutente" FROM "Tutenti" WHERE "E-mail" = %s', (data.email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email già registrata"
        )

    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    cur.execute(
        'INSERT INTO "Tutenti" ("E-mail", "passwd_hash", "Ruolo") VALUES (%s, %s, %s)',
        (data.email, hashed, data.ruolo)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Utente registrato con successo"}