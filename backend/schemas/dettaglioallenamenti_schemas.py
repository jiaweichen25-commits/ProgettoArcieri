from pydantic import BaseModel
from typing import Optional


# ─────────────────────────────────────────
# TdetAllenamenti  (la riga griglia)
# ─────────────────────────────────────────

class DettaglioCreate(BaseModel):
    id_settimana: int
    id_seduta: int

class DettaglioOut(BaseModel):
    IDallenamento: int
    IDsettimana: int
    IDseduta: int

class SedutaEsistenteOut(BaseModel):
    IDsettimana: int
    IDseduta: int
    ha_contenuto: bool


# ─────────────────────────────────────────
# TdetStretching
# ─────────────────────────────────────────

class StretchingCreate(BaseModel):
    id_esercizio_stretching: Optional[int] = None
    lunedi:    Optional[str] = None
    martedi:   Optional[str] = None
    mercoledi: Optional[str] = None
    giovedi:   Optional[str] = None
    venerdi:   Optional[str] = None
    sabato:    Optional[str] = None
    domenica:  Optional[str] = None

class StretchingUpdate(StretchingCreate):
    pass

class StretchingOut(StretchingCreate):
    IDdetStretching: int
    IDallenamento: int
    IDsettimana: int
    IDseduta: int


# ─────────────────────────────────────────
# TdetRiscaldamento
# ─────────────────────────────────────────

class RiscaldamentoCreate(BaseModel):
    id_esercizio_riscaldamento: Optional[int] = None
    lunedi:    Optional[str] = None
    martedi:   Optional[str] = None
    mercoledi: Optional[str] = None
    giovedi:   Optional[str] = None
    venerdi:   Optional[str] = None
    sabato:    Optional[str] = None
    domenica:  Optional[str] = None

class RiscaldamentoUpdate(RiscaldamentoCreate):
    pass

class RiscaldamentoOut(RiscaldamentoCreate):
    IDdetRiscaldamento: int
    IDallenamento: int
    IDsettimana: int
    IDseduta: int


# ─────────────────────────────────────────
# TdetTecForCor
# ─────────────────────────────────────────

class TecForCorCreate(BaseModel):
    id_posizione_piedi:      Optional[int] = None
    id_distanza:             Optional[int] = None
    id_targa:                Optional[int] = None
    id_descrizione_esercizio: Optional[int] = None
    lunedi:    Optional[str] = None
    martedi:   Optional[str] = None
    mercoledi: Optional[str] = None
    giovedi:   Optional[str] = None
    venerdi:   Optional[str] = None
    sabato:    Optional[str] = None
    domenica:  Optional[str] = None

class TecForCorUpdate(TecForCorCreate):
    pass

class TecForCorOut(TecForCorCreate):
    IDdetTecForCor: int
    IDallenamento: int
    IDsettimana: int
    IDseduta: int


# ─────────────────────────────────────────
# TdetAllFisForRes
# ─────────────────────────────────────────

class AllFisForResCreate(BaseModel):
    id_tabella_n:                          Optional[int] = None
    id_descrizione_esercizio_all_fis_for_res: Optional[int] = None
    lunedi:    Optional[str] = None
    martedi:   Optional[str] = None
    mercoledi: Optional[str] = None
    giovedi:   Optional[str] = None
    venerdi:   Optional[str] = None
    sabato:    Optional[str] = None
    domenica:  Optional[str] = None

class AllFisForResUpdate(AllFisForResCreate):
    pass

class AllFisForResOut(AllFisForResCreate):
    IDdetAllFisForRes: int
    IDallenamento: int
    IDsettimana: int
    IDseduta: int


# ─────────────────────────────────────────
# TdetAllFisCor
# ─────────────────────────────────────────

class AllFisCorCreate(BaseModel):
    id_attrezzo:                        Optional[int] = None
    id_descrizione_esercizio_all_fis_cor: Optional[int] = None
    lunedi:    Optional[str] = None
    martedi:   Optional[str] = None
    mercoledi: Optional[str] = None
    giovedi:   Optional[str] = None
    venerdi:   Optional[str] = None
    sabato:    Optional[str] = None
    domenica:  Optional[str] = None

class AllFisCorUpdate(AllFisCorCreate):
    pass

class AllFisCorOut(AllFisCorCreate):
    IDdetAllFisCor: int
    IDallenamento: int
    IDsettimana: int
    IDseduta: int


# ─────────────────────────────────────────
# TdetNoteAtleta
# ─────────────────────────────────────────

class NotaAtletaCreate(BaseModel):  #NoteAtleta riguardo note su l'altleta, mentre NotaPersonal sono le note dell'atleta.
    nota: Optional[str] = None

class NotaAtletaUpdate(NotaAtletaCreate):
    pass

class NotaAtletaOut(NotaAtletaCreate):
    IDnota: int
    IDallenamento: int
    IDsettimana: int
    nota_atleta: Optional[str] = None

class NotaPersonaleUpdate(BaseModel):
    nota_atleta: Optional[str] = None

class TotaleFrecceOut(BaseModel):
    lunedi: int
    martedi: int
    mercoledi: int
    giovedi: int
    venerdi: int
    sabato: int
    domenica: int
    totale: int