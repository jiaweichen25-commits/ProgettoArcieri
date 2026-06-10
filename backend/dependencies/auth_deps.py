from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from config.settings import SECRET_KEY, ALGORITHM

security = HTTPBearer()

def get_utente_loggato(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        id_utente: int = payload.get("id_utente")
        ruolo: str = payload.get("ruolo")
        if id_utente is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token non valido")
        return {"id_utente": id_utente, "ruolo": ruolo, "email": payload.get("sub")}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token non valido")

def solo_istruttore(utente: dict = Depends(get_utente_loggato)) -> dict:
    if utente["ruolo"] != "istruttore":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accesso riservato agli istruttori")
    return utente

def solo_atleta(utente: dict = Depends(get_utente_loggato)) -> dict:
    if utente["ruolo"] != "atleta":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accesso riservato agli atleti")
    return utente
