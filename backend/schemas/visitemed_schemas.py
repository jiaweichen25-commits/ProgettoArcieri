from pydantic import BaseModel
from datetime import date

class VisitaCreate(BaseModel):
    data_visita: date
    data_scadenza: date

class VisitaUpdate(BaseModel):
    data_visita: date
    data_scadenza: date

class VisitaOut(BaseModel):
    IDvisita: int
    IDatleta: int
    data_visita: date
    data_scadenza: date