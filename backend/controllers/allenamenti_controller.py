from fastapi import APIRouter, Depends, Response, status
from typing import List
from schemas.allenamenti_schemas import AllenamentoCreate, AllenamentoUpdate, AllenamentoOut
from services import allenamenti_service
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/atleti", tags=["allenamenti"])

@router.get("/{id_atleta}/allenamenti/", response_model=List[AllenamentoOut])
def lista_allenamenti(id_atleta: int, utente: dict = Depends(solo_istruttore)):
    return allenamenti_service.get_allenamenti(utente["id_utente"], id_atleta)

@router.post("/{id_atleta}/allenamenti/", status_code=status.HTTP_201_CREATED)
def aggiungi_allenamento(id_atleta: int, dati: AllenamentoCreate, utente: dict = Depends(solo_istruttore)):
    return allenamenti_service.crea_allenamento(utente["id_utente"], id_atleta, dati.model_dump())

@router.put("/{id_atleta}/allenamenti/{id_allenamento}")
def aggiorna_allenamento(
    id_atleta: int,
    id_allenamento: int,
    dati: AllenamentoUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return allenamenti_service.modifica_allenamento(utente["id_utente"], id_atleta, id_allenamento, dati.model_dump())

@router.delete("/{id_atleta}/allenamenti/{id_allenamento}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_allenamento(id_atleta: int, id_allenamento: int, utente: dict = Depends(solo_istruttore)):
    allenamenti_service.elimina_allenamento(utente["id_utente"], id_atleta, id_allenamento)
    return Response(status_code=status.HTTP_204_NO_CONTENT)