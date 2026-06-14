from pydantic import BaseModel
from datetime import date
from typing import Optional

class PianoGaraCreate(BaseModel):
    id_tipogara: Optional[int] = None
    data: Optional[date] = None
    luogo: Optional[str] = None
    distanza: Optional[str] = None
    note: Optional[str] = None
    escludi_visualizzazione: bool = False

class PianoGaraUpdate(BaseModel):
    id_tipogara: Optional[int] = None
    data: Optional[date] = None
    luogo: Optional[str] = None
    distanza: Optional[str] = None
    note: Optional[str] = None
    escludi_visualizzazione: bool = False

class PianoGaraOut(BaseModel):
    IDpianogara: int
    IDallenamento: int
    id_tipogara: Optional[int] = None
    tipo_gara: Optional[str] = None
    data: Optional[date] = None
    luogo: Optional[str] = None
    distanza: Optional[str] = None
    note: Optional[str] = None
    escludi_visualizzazione: bool