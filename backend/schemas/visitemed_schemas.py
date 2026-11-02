from pydantic import BaseModel
from schemas.modifica import ModificaCompleta
from datetime import date

class VisitaCreate(BaseModel):
    data_visita: date
    data_scadenza: date

class VisitaUpdate(ModificaCompleta):
    data_visita: date
    data_scadenza: date

class VisitaOut(BaseModel):
    IDvisita: int
    IDatleta: int
    data_visita: date
    data_scadenza: date