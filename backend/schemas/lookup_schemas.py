
from pydantic import BaseModel
from typing import Optional


# ─────────────────────────────────────────
# LOOKUP TABLES — Out (popolano i dropdown)
# ─────────────────────────────────────────

class LookupStretchingOut(BaseModel):
    IDesercizioStretching: int
    NomeEsercizio: Optional[str] = None

class LookupRiscaldamentoOut(BaseModel):
    IDesercizioRiscaldamento: int
    NomeEsercizio: Optional[str] = None

class LookupDistanzaOut(BaseModel):
    IDdistanza: int
    NomeEsercizio: Optional[str] = None

class LookupTargaOut(BaseModel):
    IDtarga: int
    NomeTarga: Optional[str] = None

class LookupDescrizioneEsercizioOut(BaseModel):
    IDdescrizioneEsercizio: int
    NomeEsercizio: Optional[str] = None

class LookupTabellaNumeroOut(BaseModel):
    IDtabella_n: int
    NumeroTabella: Optional[int] = None

class LookupDescEsercizioAllFisForResOut(BaseModel):
    IDdescrizioneEsercizioAllFisForRes: int
    DescrizioneEsercizio: Optional[str] = None

class LookupAttrezziOut(BaseModel):
    IDattrezzo: int
    AttrezzoDes: Optional[str] = None

class LookupDescEsercizioAllFisCorOut(BaseModel):
    IDdescrizioneEsercizioAllFisCor: int
    DescrizioneEsercizio: Optional[str] = None

class LookupPosizionePiediOut(BaseModel):
    IDposizionePiedi: int
    NomePosizione: Optional[str] = None


# ─────────────────────────────────────────
# LOOKUP TABLES — Input (per il "+" sui dropdown)
# ─────────────────────────────────────────

class LookupNomeCreate(BaseModel):
    nome: str

class LookupNumeroCreate(BaseModel):
    numero: int