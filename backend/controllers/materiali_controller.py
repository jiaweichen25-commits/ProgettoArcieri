from fastapi import APIRouter, Depends, Response, status
from typing import List
from schemas.materiali_schemas import MaterialeCreate, MaterialeUpdate, MaterialeOut
from services import materiali_service
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/atleti", tags=["materiali"])

@router.get("/{id_atleta}/materiali/", response_model=List[MaterialeOut])
def lista_materiali(id_atleta: int, utente: dict = Depends(solo_istruttore)):
    return materiali_service.get_materiali(utente["id_utente"], id_atleta)

@router.post("/{id_atleta}/materiali/", status_code=status.HTTP_201_CREATED)
def aggiungi_materiale(id_atleta: int, dati: MaterialeCreate, utente: dict = Depends(solo_istruttore)):
    return materiali_service.crea_materiale(utente["id_utente"], id_atleta, dati.model_dump())

@router.put("/{id_atleta}/materiali/{id_materiale}")
def aggiorna_materiale(
    id_atleta: int,
    id_materiale: int,
    dati: MaterialeUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return materiali_service.modifica_materiale(
        utente["id_utente"], id_atleta, id_materiale, dati.model_dump()
    )

@router.delete("/{id_atleta}/materiali/{id_materiale}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_materiale(id_atleta: int, id_materiale: int, utente: dict = Depends(solo_istruttore)):
    materiali_service.elimina_materiale(utente["id_utente"], id_atleta, id_materiale)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
