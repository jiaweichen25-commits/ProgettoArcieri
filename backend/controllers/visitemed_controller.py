from fastapi import APIRouter, Depends, Response, status
from typing import List
from schemas.visitemed_schemas import VisitaCreate, VisitaUpdate, VisitaOut
from services import visitemed_service
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/atleti", tags=["visite-mediche"])

@router.get("/{id_atleta}/visite/", response_model=List[VisitaOut])
def lista_visite(id_atleta: int, utente: dict = Depends(solo_istruttore)):
    return visitemed_service.get_visite(utente["id_utente"], id_atleta)

@router.post("/{id_atleta}/visite/", status_code=status.HTTP_201_CREATED)
def aggiungi_visita(id_atleta: int, dati: VisitaCreate, utente: dict = Depends(solo_istruttore)):
    return visitemed_service.crea_visita(utente["id_utente"], id_atleta, dati.model_dump())

@router.put("/{id_atleta}/visite/{id_visita}")
def aggiorna_visita(
    id_atleta: int,
    id_visita: int,
    dati: VisitaUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return visitemed_service.modifica_visita(utente["id_utente"], id_atleta, id_visita, dati.model_dump())

@router.delete("/{id_atleta}/visite/{id_visita}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_visita(id_atleta: int, id_visita: int, utente: dict = Depends(solo_istruttore)):
    visitemed_service.elimina_visita(utente["id_utente"], id_atleta, id_visita)
    return Response(status_code=status.HTTP_204_NO_CONTENT)