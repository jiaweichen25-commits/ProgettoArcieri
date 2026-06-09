from pydantic import BaseModel
from typing import Optional
from datetime import date

class AllenamentoCreate(BaseModel):
    IDatleta:   int
    DataInizio: date
    DataFine:   date
    Obiettivi:  Optional[str] = None
