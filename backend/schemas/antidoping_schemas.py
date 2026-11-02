from pydantic import BaseModel
from schemas.modifica import ModificaCompleta
from datetime import date
from typing import Optional

class AntidopingCreate(BaseModel):
    anno: int
    autorizzazione_fitarco: bool = False
    scadenza_autorizzazione: Optional[date] = None

class AntidopingUpdate(ModificaCompleta):
    anno: int
    autorizzazione_fitarco: bool = False
    scadenza_autorizzazione: Optional[date] = None

class AntidopingOut(BaseModel):
    IDantidoping: int
    IDatleta: int
    anno: int
    autorizzazione_fitarco: bool
    scadenza_autorizzazione: Optional[date] = None