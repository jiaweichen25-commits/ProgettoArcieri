from fastapi import APIRouter, Depends, Response, status
from typing import List
from schemas.antidoping_schemas import AntidopingCreate, AntidopingUpdate, AntidopingOut
from services import antidoping_service
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/atleti", tags=["antidoping"])

@router.get("/{id_atleta}/antidoping/", response_model=List[AntidopingOut])
def lista_antidoping(id_atleta: int, utente: dict = Depends(solo_istruttore)):
    return antidoping_service.get_antidoping(utente["id_utente"], id_atleta)

@router.post("/{id_atleta}/antidoping/", status_code=status.HTTP_201_CREATED)
def aggiungi_antidoping(id_atleta: int, dati: AntidopingCreate, utente: dict = Depends(solo_istruttore)):
    return antidoping_service.crea_antidoping(utente["id_utente"], id_atleta, dati.model_dump())

@router.put("/{id_atleta}/antidoping/{id_antidoping}")
def aggiorna_antidoping(
    id_atleta: int,
    id_antidoping: int,
    dati: AntidopingUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return antidoping_service.modifica_antidoping(utente["id_utente"], id_atleta, id_antidoping, dati.model_dump())

@router.delete("/{id_atleta}/antidoping/{id_antidoping}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_antidoping(id_atleta: int, id_antidoping: int, utente: dict = Depends(solo_istruttore)):
    antidoping_service.elimina_antidoping(utente["id_utente"], id_atleta, id_antidoping)
    return Response(status_code=status.HTTP_204_NO_CONTENT)