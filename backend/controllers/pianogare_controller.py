from fastapi import APIRouter, Depends, Response, status
from typing import List
from schemas.pianogare_schemas import PianoGaraCreate, PianoGaraUpdate, PianoGaraOut, TipoGaraCreate, TipoGaraOut
from services import pianogare_service
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/allenamenti", tags=["piano-gare"])

@router.get("/{id_allenamento}/gare/", response_model=List[PianoGaraOut])
def lista_gare(id_allenamento: int, utente: dict = Depends(solo_istruttore)):
    return pianogare_service.get_gare(utente["id_utente"], id_allenamento)

@router.post("/{id_allenamento}/gare/", status_code=status.HTTP_201_CREATED)
def aggiungi_gara(id_allenamento: int, dati: PianoGaraCreate, utente: dict = Depends(solo_istruttore)):
    return pianogare_service.crea_gara(utente["id_utente"], id_allenamento, dati.model_dump())

@router.put("/{id_allenamento}/gare/{id_pianogara}")
def aggiorna_gara(
    id_allenamento: int,
    id_pianogara: int,
    dati: PianoGaraUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return pianogare_service.modifica_gara(utente["id_utente"], id_allenamento, id_pianogara, dati.model_dump())

@router.delete("/{id_allenamento}/gare/{id_pianogara}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_gara(id_allenamento: int, id_pianogara: int, utente: dict = Depends(solo_istruttore)):
    pianogare_service.elimina_gara(utente["id_utente"], id_allenamento, id_pianogara)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/tipi-gara/", response_model=List[TipoGaraOut])
def lista_tipi_gara(utente: dict = Depends(solo_istruttore)):
    return pianogare_service.get_tipi_gara()

@router.post("/tipi-gara/", status_code=status.HTTP_201_CREATED)
def aggiungi_tipo_gara(dati: TipoGaraCreate, utente: dict = Depends(solo_istruttore)):
    return pianogare_service.crea_tipo_gara(dati.descrizione)

@router.delete("/tipi-gara/{id_tipogara}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_tipo_gara(id_tipogara: int, utente: dict = Depends(solo_istruttore)):
    pianogare_service.elimina_tipo_gara(id_tipogara)
    return Response(status_code=status.HTTP_204_NO_CONTENT)