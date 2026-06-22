from fastapi import APIRouter, Depends, Response, status
from typing import List
from schemas.dettaglioallenamenti_schemas import (
    DettaglioCreate, DettaglioOut,
    StretchingCreate, StretchingUpdate, StretchingOut,
    RiscaldamentoCreate, RiscaldamentoUpdate, RiscaldamentoOut,
    TecForCorCreate, TecForCorUpdate, TecForCorOut,
    AllFisForResCreate, AllFisForResUpdate, AllFisForResOut,
    AllFisCorCreate, AllFisCorUpdate, AllFisCorOut,
    NotaAtletaCreate, NotaAtletaOut,
)
from services import dettaglioallenamenti_service as svc
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/allenamenti", tags=["dettaglio allenamenti"])


# ─────────────────────────────────────────
# TdetAllenamenti  (la riga griglia)
# ─────────────────────────────────────────

@router.post("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/inizializza", status_code=status.HTTP_200_OK)
def inizializza_seduta(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    utente: dict = Depends(solo_istruttore),
):
    svc.crea_seduta_se_non_esiste(id_allenamento, id_settimana, id_seduta)
    return {"ok": True}

@router.get("/{id_allenamento}/settimane/{id_settimana}/sedute/", response_model=List[DettaglioOut])
def lista_sedute(
    id_allenamento: int,
    id_settimana: int,
    utente: dict = Depends(solo_istruttore),
):
    return svc.get_sedute(id_allenamento, id_settimana)

@router.post("/{id_allenamento}/settimane/{id_settimana}/sedute/", status_code=status.HTTP_201_CREATED)
def aggiungi_seduta(
    id_allenamento: int,
    id_settimana: int,
    dati: DettaglioCreate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.crea_seduta(id_allenamento, dati.model_dump())

@router.delete("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_seduta(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    utente: dict = Depends(solo_istruttore),
):
    svc.elimina_seduta(id_allenamento, id_settimana, id_seduta)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# TdetStretching
# ─────────────────────────────────────────

@router.get("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/stretching/", response_model=List[StretchingOut])
def lista_stretching(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    utente: dict = Depends(solo_istruttore),
):
    return svc.get_stretching(id_allenamento, id_settimana, id_seduta)

@router.post("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/stretching/", status_code=status.HTTP_201_CREATED)
def aggiungi_stretching(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    dati: StretchingCreate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.crea_stretching(id_allenamento, id_settimana, id_seduta, dati.model_dump())

@router.put("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/stretching/{id_det}")
def aggiorna_stretching(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    dati: StretchingUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.modifica_stretching(id_det, dati.model_dump())

@router.delete("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/stretching/{id_det}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_stretching(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    utente: dict = Depends(solo_istruttore),
):
    svc.elimina_stretching(id_det)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# TdetRiscaldamento
# ─────────────────────────────────────────

@router.get("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/riscaldamento/", response_model=List[RiscaldamentoOut])
def lista_riscaldamento(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    utente: dict = Depends(solo_istruttore),
):
    return svc.get_riscaldamento(id_allenamento, id_settimana, id_seduta)

@router.post("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/riscaldamento/", status_code=status.HTTP_201_CREATED)
def aggiungi_riscaldamento(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    dati: RiscaldamentoCreate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.crea_riscaldamento(id_allenamento, id_settimana, id_seduta, dati.model_dump())

@router.put("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/riscaldamento/{id_det}")
def aggiorna_riscaldamento(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    dati: RiscaldamentoUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.modifica_riscaldamento(id_det, dati.model_dump())

@router.delete("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/riscaldamento/{id_det}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_riscaldamento(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    utente: dict = Depends(solo_istruttore),
):
    svc.elimina_riscaldamento(id_det)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# TdetTecForCor
# ─────────────────────────────────────────

@router.get("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/tecforcor/", response_model=List[TecForCorOut])
def lista_tec_for_cor(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    utente: dict = Depends(solo_istruttore),
):
    return svc.get_tec_for_cor(id_allenamento, id_settimana, id_seduta)

@router.post("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/tecforcor/", status_code=status.HTTP_201_CREATED)
def aggiungi_tec_for_cor(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    dati: TecForCorCreate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.crea_tec_for_cor(id_allenamento, id_settimana, id_seduta, dati.model_dump())

@router.put("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/tecforcor/{id_det}")
def aggiorna_tec_for_cor(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    dati: TecForCorUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.modifica_tec_for_cor(id_det, dati.model_dump())

@router.delete("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/tecforcor/{id_det}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_tec_for_cor(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    utente: dict = Depends(solo_istruttore),
):
    svc.elimina_tec_for_cor(id_det)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# TdetAllFisForRes
# ─────────────────────────────────────────

@router.get("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/allfisforres/", response_model=List[AllFisForResOut])
def lista_all_fis_for_res(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    utente: dict = Depends(solo_istruttore),
):
    return svc.get_all_fis_for_res(id_allenamento, id_settimana, id_seduta)

@router.post("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/allfisforres/", status_code=status.HTTP_201_CREATED)
def aggiungi_all_fis_for_res(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    dati: AllFisForResCreate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.crea_all_fis_for_res(id_allenamento, id_settimana, id_seduta, dati.model_dump())

@router.put("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/allfisforres/{id_det}")
def aggiorna_all_fis_for_res(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    dati: AllFisForResUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.modifica_all_fis_for_res(id_det, dati.model_dump())

@router.delete("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/allfisforres/{id_det}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_all_fis_for_res(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    utente: dict = Depends(solo_istruttore),
):
    svc.elimina_all_fis_for_res(id_det)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# TdetAllFisCor
# ─────────────────────────────────────────

@router.get("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/allfiscor/", response_model=List[AllFisCorOut])
def lista_all_fis_cor(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    utente: dict = Depends(solo_istruttore),
):
    return svc.get_all_fis_cor(id_allenamento, id_settimana, id_seduta)

@router.post("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/allfiscor/", status_code=status.HTTP_201_CREATED)
def aggiungi_all_fis_cor(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    dati: AllFisCorCreate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.crea_all_fis_cor(id_allenamento, id_settimana, id_seduta, dati.model_dump())

@router.put("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/allfiscor/{id_det}")
def aggiorna_all_fis_cor(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    dati: AllFisCorUpdate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.modifica_all_fis_cor(id_det, dati.model_dump())

@router.delete("/{id_allenamento}/settimane/{id_settimana}/sedute/{id_seduta}/allfiscor/{id_det}", status_code=status.HTTP_204_NO_CONTENT)
def cancella_all_fis_cor(
    id_allenamento: int,
    id_settimana: int,
    id_seduta: int,
    id_det: int,
    utente: dict = Depends(solo_istruttore),
):
    svc.elimina_all_fis_cor(id_det)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# TdetNoteAtleta
# ─────────────────────────────────────────

@router.get("/{id_allenamento}/settimane/{id_settimana}/nota/")
def get_nota(
    id_allenamento: int,
    id_settimana: int,
    utente: dict = Depends(solo_istruttore),
):
    return svc.get_nota(id_allenamento, id_settimana)

@router.post("/{id_allenamento}/settimane/{id_settimana}/nota/", status_code=status.HTTP_201_CREATED)
def salva_nota(
    id_allenamento: int,
    id_settimana: int,
    dati: NotaAtletaCreate,
    utente: dict = Depends(solo_istruttore),
):
    return svc.salva_nota(id_allenamento, id_settimana, dati.model_dump())

