from fastapi import APIRouter, Depends, Response, status
from typing import List
from schemas.segnapunti_schemas import (
    SegnapuntoCreate, SegnapuntoUpdate, SegnapuntoOut, VoleeIn, VoleeOut
)
from services import me_service
from dependencies.auth_deps import solo_atleta

router = APIRouter(prefix="/me/segnapunti", tags=["area-atleta-segnapunti"])


@router.get("/", response_model=List[SegnapuntoOut])
def lista_miei_segnapunti(utente: dict = Depends(solo_atleta)):
    return me_service.get_miei_segnapunti(utente["id_utente"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def crea_mio_segnapunto(dati: SegnapuntoCreate, utente: dict = Depends(solo_atleta)):
    return me_service.crea_mio_segnapunto(utente["id_utente"], dati.model_dump())


@router.get("/{id_segnapunto}", response_model=SegnapuntoOut)
def get_mio_segnapunto(id_segnapunto: int, utente: dict = Depends(solo_atleta)):
    return me_service.get_mio_segnapunto(utente["id_utente"], id_segnapunto)


@router.put("/{id_segnapunto}")
def aggiorna_mio_segnapunto(
    id_segnapunto: int,
    dati: SegnapuntoUpdate,
    utente: dict = Depends(solo_atleta),
):
    return me_service.aggiorna_mio_segnapunto(
        utente["id_utente"], id_segnapunto, dati.model_dump()
    )


@router.delete("/{id_segnapunto}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_mio_segnapunto(id_segnapunto: int, utente: dict = Depends(solo_atleta)):
    me_service.elimina_mio_segnapunto(utente["id_utente"], id_segnapunto)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{id_segnapunto}/volee/", response_model=List[VoleeOut])
def get_mie_volee(id_segnapunto: int, utente: dict = Depends(solo_atleta)):
    return me_service.get_mie_volee(utente["id_utente"], id_segnapunto)


@router.post("/{id_segnapunto}/volee/")
def salva_mie_volee(
    id_segnapunto: int,
    volee: List[VoleeIn],
    utente: dict = Depends(solo_atleta),
):
    return me_service.salva_mie_volee(
        utente["id_utente"], id_segnapunto,
        [v.model_dump() for v in volee]
    )
