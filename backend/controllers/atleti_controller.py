from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from schemas.atleti_schemas import AtletaCreate, AtletaUpdate, AtletaOut
from services import atleti_service
from config.settings import SECRET_KEY, ALGORITHM
from typing import List

router = APIRouter(prefix="/atleti", tags=["atleti"])
security = HTTPBearer()

# --- DIPENDENZE DI SICUREZZA ---

def get_utente_loggato(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Legge il JWT e restituisce i dati dell'utente loggato."""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        id_utente: int = payload.get("id_utente")
        ruolo: str = payload.get("ruolo")
        if id_utente is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token non valido")
        return {"id_utente": id_utente, "ruolo": ruolo}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token non valido")

def solo_istruttore(utente: dict = Depends(get_utente_loggato)) -> dict:
    """Blocca l'accesso se l'utente non è un istruttore."""
    if utente["ruolo"] != "istruttore":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accesso riservato agli istruttori")
    return utente

# --- ENDPOINT ---

@router.get("/", response_model=List[AtletaOut])
def lista_atleti(utente: dict = Depends(solo_istruttore)):
    return atleti_service.get_atleti(utente["id_utente"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def aggiungi_atleta(dati: AtletaCreate, utente: dict = Depends(solo_istruttore)):
    return atleti_service.crea_atleta(utente["id_utente"], dati.model_dump())

@router.put("/{id_atleta}")
def aggiorna_atleta(id_atleta: int, dati: AtletaUpdate, utente: dict = Depends(solo_istruttore)):
    return atleti_service.modifica_atleta(id_atleta, utente["id_utente"], dati.model_dump())

@router.delete("/{id_atleta}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_atleta(id_atleta: int, utente: dict = Depends(solo_istruttore)):
    atleti_service.elimina_atleta(id_atleta, utente["id_utente"])
    return Response(status_code=status.HTTP_204_NO_CONTENT)