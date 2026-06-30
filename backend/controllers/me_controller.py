from fastapi import APIRouter, Depends
from typing import List
from schemas.atleti_schemas import AtletaOut
from schemas.materiali_schemas import MaterialeOut
from services import me_service
from dependencies.auth_deps import solo_atleta

router = APIRouter(prefix="/me", tags=["area-atleta"])

@router.get("/profilo", response_model=AtletaOut)
def mio_profilo(utente: dict = Depends(solo_atleta)):
    return me_service.get_profilo(utente["id_utente"])

@router.get("/materiali", response_model=List[MaterialeOut])
def i_miei_materiali(utente: dict = Depends(solo_atleta)):
    return me_service.get_materiali(utente["id_utente"])

@router.get("/allenamenti")
def i_miei_allenamenti(utente: dict = Depends(solo_atleta)):
    return me_service.get_allenamenti(utente["id_utente"])

@router.get("/visite")
def le_mie_visite(utente: dict = Depends(solo_atleta)):
    return me_service.get_visite(utente["id_utente"])

@router.get("/antidoping")
def il_mio_antidoping(utente: dict = Depends(solo_atleta)):
    return me_service.get_antidoping(utente["id_utente"])

@router.get("/piano-gare")
def il_mio_piano_gare(utente: dict = Depends(solo_atleta)):
    return me_service.get_piano_gare(utente["id_utente"])

@router.get("/allenamenti/{id_allenamento}/dettaglio")
def il_mio_dettaglio_allenamento(id_allenamento: int, utente: dict = Depends(solo_atleta)):
    return me_service.get_dettaglio_allenamento(utente["id_utente"], id_allenamento)