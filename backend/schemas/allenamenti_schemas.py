from pydantic import BaseModel
from schemas.modifica import ModificaCompleta
from datetime import date
from typing import Optional

class AllenamentoCreate(BaseModel):
    data_inizio: date
    data_fine: date
    obiettivi: Optional[str] = None

class AllenamentoUpdate(ModificaCompleta):
    data_inizio: date
    data_fine: date
    obiettivi: Optional[str] = None

class AllenamentoOut(BaseModel):
    IDallenamento: int
    IDatleta: int
    data_inizio: date
    data_fine: date
    obiettivi: Optional[str] = None