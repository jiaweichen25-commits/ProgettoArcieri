from fastapi import APIRouter, Depends
from typing import List
from schemas.segnapunti_schemas import SegnapuntoOut, VoleeOut
from services import segnapunti_service
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/atleti", tags=["segnapunti"])


@router.get("/{id_atleta}/segnapunti/", response_model=List[SegnapuntoOut])
def lista_segnapunti(id_atleta: int, utente: dict = Depends(solo_istruttore)):
    return segnapunti_service.get_segnapunti(utente["id_utente"], id_atleta)


@router.get("/{id_atleta}/segnapunti/{id_segnapunto}", response_model=SegnapuntoOut)
def get_segnapunto(
    id_atleta: int,
    id_segnapunto: int,
    utente: dict = Depends(solo_istruttore),
):
    return segnapunti_service.get_segnapunto(utente["id_utente"], id_atleta, id_segnapunto)


@router.get("/{id_atleta}/segnapunti/{id_segnapunto}/volee/", response_model=List[VoleeOut])
def get_volee(
    id_atleta: int,
    id_segnapunto: int,
    utente: dict = Depends(solo_istruttore),
):
    return segnapunti_service.get_volee(utente["id_utente"], id_atleta, id_segnapunto)