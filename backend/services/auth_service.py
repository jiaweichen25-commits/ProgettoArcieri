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

def authenticate_user(email: str, password: str, portale: str):
    user = user_repository.get_user_by_email_or_username(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")

    must_change = user[3] if len(user) > 3 else False
    sospeso_fino_al = user[4] if len(user) > 4 else None
    
    if sospeso_fino_al:
        if isinstance(sospeso_fino_al, str):
            sospeso_fino_al = datetime.strptime(sospeso_fino_al, "%Y-%m-%d").date()
        if sospeso_fino_al >= datetime.now().date():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Account sospeso fino al {sospeso_fino_al}")
    # Se il portale è istruttore, un admin può loggarsi qui se vogliamo? 
    # Il frontend dovrebbe inviare portale=admin, non istruttore, se è admin.
    if user[1] != portale:
        # Se un admin cerca di accedere dal portale istruttore, lo autorizziamo ma cambiamo il ruolo nel token
        # oppure frontend manderà 'admin' come portale
        if not (portale == "istruttore" and user[1] == "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accesso non autorizzato per questo portale"
            )

    if not bcrypt.checkpw(password.encode(), user[0].encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")

    token = create_access_token({"sub": email, "ruolo": user[1], "id_utente": user[2], "must_change_password": must_change})
    return token, must_change

def register_user(email: str, password: str, ruolo: str, nome: str = None, cognome: str = None, qualifica: str = None):
    existing_user = user_repository.get_user_by_email_or_username(email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email già registrata")
        
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    try:
        user_repository.create_user(email, hashed, ruolo)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email già registrata")
    
    new_user = user_repository.get_user_by_email_or_username(email)
    id_utente = new_user[2]

    if ruolo == "istruttore":
        user_repository.create_istruttore(
            id_utente,
            nome.strip(),
            cognome.strip(),
            email,
            qualifica.strip() if qualifica else None,
        )

    token = create_access_token({"sub": email, "ruolo": ruolo, "id_utente": id_utente, "must_change_password": False})
    return token

def change_user_password(email: str, old_password: str, new_password: str):
    user = user_repository.get_user_by_email_or_username(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utente non trovato")
        
    if not bcrypt.checkpw(old_password.encode(), user[0].encode()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La password attuale è errata")
        
    new_hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    user_repository.update_user_password(user[2], new_hashed)
    return True
