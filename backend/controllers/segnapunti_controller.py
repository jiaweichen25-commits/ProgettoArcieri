from fastapi import APIRouter, Depends, Response, status
from typing import List
from schemas.segnapunti_schemas import (
    SegnapuntoCreate, SegnapuntoUpdate, SegnapuntoOut, VoleeIn, VoleeOut
)
from services import segnapunti_service
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/atleti", tags=["segnapunti"])


@router.get("/{id_atleta}/segnapunti/", response_model=List[SegnapuntoOut])
def lista_segnapunti(id_atleta: int, utente: dict = Depends(solo_istruttore)):
    return segnapunti_service.get_segnapunti(utente["id_utente"], id_atleta)


@router.post("/{id_atleta}/segnapunti/", status_code=status.HTTP_201_CREATED)
def crea_segnapunto(
    id_atleta: int,
    dati: SegnapuntoCreate,
    utente: dict = Depends(solo_istruttore),
):
    return segnapunti_service.crea_segnapunto(utente["id_utente"], id_atleta, dati.model_dump())


@router.get("/{id_atleta}/segnapunti/{id_segnapunto}", response_model=SegnapuntoOut)
def get_segnapunto(
    id_atleta: int,
    id_segnapunto: int,
    utente: dict = Depends(solo_istruttore),
):
    return segnapunti_service.get_segnapunto(utente["id_utente"], id_atleta, id_segnapunto)


@router.put("/{id_atleta}/segnapunti/{id_segnapunto}")
def aggiorna_segnapunto(
    id_atleta: int,
    id_segnapunto: int,
    dati: SegnapuntoUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return segnapunti_service.aggiorna_segnapunto(
        utente["id_utente"], id_atleta, id_segnapunto, dati.model_dump()
    )


@router.delete("/{id_atleta}/segnapunti/{id_segnapunto}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_segnapunto(
    id_atleta: int,
    id_segnapunto: int,
    utente: dict = Depends(solo_istruttore),
):
    segnapunti_service.elimina_segnapunto(utente["id_utente"], id_atleta, id_segnapunto)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{id_atleta}/segnapunti/{id_segnapunto}/volee/", response_model=List[VoleeOut])
def get_volee(
    id_atleta: int,
    id_segnapunto: int,
    utente: dict = Depends(solo_istruttore),
):
    return segnapunti_service.get_volee(utente["id_utente"], id_atleta, id_segnapunto)


@router.post("/{id_atleta}/segnapunti/{id_segnapunto}/volee/")
def salva_volee(
    id_atleta: int,
    id_segnapunto: int,
    volee: List[VoleeIn],
    utente: dict = Depends(solo_istruttore),
):
    return segnapunti_service.salva_volee(
        utente["id_utente"], id_atleta, id_segnapunto,
        [v.model_dump() for v in volee]
    )