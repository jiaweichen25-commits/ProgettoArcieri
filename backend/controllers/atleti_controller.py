from fastapi import APIRouter, Depends, status, Response
from schemas.atleti_schemas import AtletaCreate, AtletaUpdate, AtletaOut
from services import atleti_service
from dependencies.auth_deps import solo_istruttore
from typing import List

router = APIRouter(prefix="/atleti", tags=["atleti"])

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