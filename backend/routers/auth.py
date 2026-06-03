from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status
from jose import jwt
import bcrypt
# MODIFICATO: Aggiunto 'timezone' per evitare i warning di deprecazione in Python 3.12
from datetime import datetime, timedelta, timezone 
import os

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
    email: str
    password: str

class TokenOutput(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict):
    to_encode = data.copy()
    # MODIFICATO: Sostituito 'datetime.utcnow()' (deprecato in 3.12) con 'datetime.now(timezone.utc)'
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login", response_model=TokenOutput)
def login(data: LoginInput):
    conn = get_db_conn()
    # MODIFICATO: Inserito il blocco try...finally per garantire la chiusura della connessione PostgreSQL
    try:
        # MODIFICATO: Utilizzato il context manager 'with' per gestire e chiudere automaticamente il cursore
        with conn.cursor() as cur:
            cur.execute('SELECT "passwd_hash", "Ruolo" FROM "Tutenti" WHERE "E-mail" = %s', (data.email,))
            user = cur.fetchone()
    finally:
        conn.close() # Questo si attiva SEMPRE, evitando la perdita (leak) di connessioni sul database

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")

    if not bcrypt.checkpw(data.password.encode(), user[0].encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")

    token = create_access_token({"sub": data.email, "ruolo": user[1]})
    return TokenOutput(access_token=token, token_type="bearer")

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: LoginInput):
    conn = get_db_conn()
    # MODIFICATO: Inserito try...finally e rimosse tutte le chiusure manuali duplicate (cur.close(), conn.close())
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDutente" FROM "Tutenti" WHERE "E-mail" = %s', (data.email,))
            if cur.fetchone():
                # MODIFICATO: Ora se si attiva questa eccezione, il 'finally' sottostante chiuderà comunque il DB al posto tuo
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email già registrata"
                )

            hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
            cur.execute(
                'INSERT INTO "Tutenti" ("E-mail", "passwd_hash", "Ruolo") VALUES (%s, %s, %s)',
                (data.email, hashed, "atleta")
            )
            conn.commit()
    finally:
        conn.close() # Chiude la connessione sia in caso di successo, sia in caso di errore "Email già registrata" o crash della query

    return {"message": "Utente registrato con successo"}