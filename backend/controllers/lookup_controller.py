from fastapi import APIRouter, Depends, Response, status, HTTPException
from typing import List
from schemas.lookup_schemas import (
    LookupStretchingOut, LookupRiscaldamentoOut, LookupDistanzaOut,
    LookupTargaOut, LookupDescrizioneEsercizioOut, LookupTabellaNumeroOut,
    LookupDescEsercizioAllFisForResOut, LookupAttrezziOut, LookupDescEsercizioAllFisCorOut,
    LookupNomeCreate, LookupNumeroCreate
)
from services import lookup_service as svc
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/allenamenti/lookup", tags=["lookup"])


# ─────────────────────────────────────────
# STRETCHING
# ─────────────────────────────────────────

@router.get("/stretching/", response_model=List[LookupStretchingOut])
def get_stretching(utente: dict = Depends(solo_istruttore)):
    return svc.get_lookup_stretching()

@router.post("/stretching/", response_model=LookupStretchingOut, status_code=status.HTTP_201_CREATED)
def crea_stretching(dati: LookupNomeCreate, utente: dict = Depends(solo_istruttore)):
    return svc.crea_lookup_stretching(dati.nome)

@router.delete("/stretching/{id_}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_stretching(id_: int, utente: dict = Depends(solo_istruttore)):
    ok = svc.elimina_lookup_stretching(id_)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# RISCALDAMENTO
# ─────────────────────────────────────────

@router.get("/riscaldamento/", response_model=List[LookupRiscaldamentoOut])
def get_riscaldamento(utente: dict = Depends(solo_istruttore)):
    return svc.get_lookup_riscaldamento()

@router.post("/riscaldamento/", response_model=LookupRiscaldamentoOut, status_code=status.HTTP_201_CREATED)
def crea_riscaldamento(dati: LookupNomeCreate, utente: dict = Depends(solo_istruttore)):
    return svc.crea_lookup_riscaldamento(dati.nome)

@router.delete("/riscaldamento/{id_}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_riscaldamento(id_: int, utente: dict = Depends(solo_istruttore)):
    ok = svc.elimina_lookup_riscaldamento(id_)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# DISTANZA
# ─────────────────────────────────────────

@router.get("/distanza/", response_model=List[LookupDistanzaOut])
def get_distanza(utente: dict = Depends(solo_istruttore)):
    return svc.get_lookup_distanza()

@router.post("/distanza/", response_model=LookupDistanzaOut, status_code=status.HTTP_201_CREATED)
def crea_distanza(dati: LookupNomeCreate, utente: dict = Depends(solo_istruttore)):
    return svc.crea_lookup_distanza(dati.nome)

@router.delete("/distanza/{id_}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_distanza(id_: int, utente: dict = Depends(solo_istruttore)):
    ok = svc.elimina_lookup_distanza(id_)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# TARGA
# ─────────────────────────────────────────

@router.get("/targa/", response_model=List[LookupTargaOut])
def get_targa(utente: dict = Depends(solo_istruttore)):
    return svc.get_lookup_targa()

@router.post("/targa/", response_model=LookupTargaOut, status_code=status.HTTP_201_CREATED)
def crea_targa(dati: LookupNomeCreate, utente: dict = Depends(solo_istruttore)):
    return svc.crea_lookup_targa(dati.nome)

@router.delete("/targa/{id_}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_targa(id_: int, utente: dict = Depends(solo_istruttore)):
    ok = svc.elimina_lookup_targa(id_)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# DESCRIZIONE ESERCIZIO (TecForCor)
# ─────────────────────────────────────────

@router.get("/descrizione-esercizio/", response_model=List[LookupDescrizioneEsercizioOut])
def get_descrizione_esercizio(utente: dict = Depends(solo_istruttore)):
    return svc.get_lookup_descrizione_esercizio()

@router.post("/descrizione-esercizio/", response_model=LookupDescrizioneEsercizioOut, status_code=status.HTTP_201_CREATED)
def crea_descrizione_esercizio(dati: LookupNomeCreate, utente: dict = Depends(solo_istruttore)):
    return svc.crea_lookup_descrizione_esercizio(dati.nome)

@router.delete("/descrizione-esercizio/{id_}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_descrizione_esercizio(id_: int, utente: dict = Depends(solo_istruttore)):
    ok = svc.elimina_lookup_descrizione_esercizio(id_)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# TABELLA NUMERO (ForRes)
# ─────────────────────────────────────────

@router.get("/tabella-numero/", response_model=List[LookupTabellaNumeroOut])
def get_tabella_numero(utente: dict = Depends(solo_istruttore)):
    return svc.get_lookup_tabella_numero()

@router.post("/tabella-numero/", response_model=LookupTabellaNumeroOut, status_code=status.HTTP_201_CREATED)
def crea_tabella_numero(dati: LookupNumeroCreate, utente: dict = Depends(solo_istruttore)):
    return svc.crea_lookup_tabella_numero(dati.numero)

@router.delete("/tabella-numero/{id_}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_tabella_numero(id_: int, utente: dict = Depends(solo_istruttore)):
    ok = svc.elimina_lookup_tabella_numero(id_)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# DESCRIZIONE ESERCIZIO ALL FIS FOR RES
# ─────────────────────────────────────────

@router.get("/allfisforres-descrizione/", response_model=List[LookupDescEsercizioAllFisForResOut])
def get_desc_all_fis_for_res(utente: dict = Depends(solo_istruttore)):
    return svc.get_lookup_desc_esercizio_all_fis_for_res()

@router.post("/allfisforres-descrizione/", response_model=LookupDescEsercizioAllFisForResOut, status_code=status.HTTP_201_CREATED)
def crea_desc_all_fis_for_res(dati: LookupNomeCreate, utente: dict = Depends(solo_istruttore)):
    return svc.crea_lookup_desc_esercizio_all_fis_for_res(dati.nome)

@router.delete("/allfisforres-descrizione/{id_}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_desc_all_fis_for_res(id_: int, utente: dict = Depends(solo_istruttore)):
    ok = svc.elimina_lookup_desc_esercizio_all_fis_for_res(id_)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# ATTREZZI
# ─────────────────────────────────────────

@router.get("/attrezzi/", response_model=List[LookupAttrezziOut])
def get_attrezzi(utente: dict = Depends(solo_istruttore)):
    return svc.get_lookup_attrezzi()

@router.post("/attrezzi/", response_model=LookupAttrezziOut, status_code=status.HTTP_201_CREATED)
def crea_attrezzi(dati: LookupNomeCreate, utente: dict = Depends(solo_istruttore)):
    return svc.crea_lookup_attrezzi(dati.nome)

@router.delete("/attrezzi/{id_}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_attrezzi(id_: int, utente: dict = Depends(solo_istruttore)):
    ok = svc.elimina_lookup_attrezzi(id_)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# DESCRIZIONE ESERCIZIO ALL FIS COR
# ─────────────────────────────────────────

@router.get("/allfiscor-descrizione/", response_model=List[LookupDescEsercizioAllFisCorOut])
def get_desc_all_fis_cor(utente: dict = Depends(solo_istruttore)):
    return svc.get_lookup_desc_esercizio_all_fis_cor()

@router.post("/allfiscor-descrizione/", response_model=LookupDescEsercizioAllFisCorOut, status_code=status.HTTP_201_CREATED)
def crea_desc_all_fis_cor(dati: LookupNomeCreate, utente: dict = Depends(solo_istruttore)):
    return svc.crea_lookup_desc_esercizio_all_fis_cor(dati.nome)

@router.delete("/allfiscor-descrizione/{id_}", status_code=status.HTTP_204_NO_CONTENT)
def elimina_desc_all_fis_cor(id_: int, utente: dict = Depends(solo_istruttore)):
    ok = svc.elimina_lookup_desc_esercizio_all_fis_cor(id_)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
