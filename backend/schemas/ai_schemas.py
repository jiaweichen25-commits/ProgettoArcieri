from pydantic import BaseModel
from datetime import datetime


class DomandaAI(BaseModel):
    IDatleta: int
    RuoloUtente: str
    Domanda: str


class RispostaAI(BaseModel):
    RispostaAI: str


class CronologiaItem(BaseModel):
    IDcronologia: int
    IDatleta: int
    Domanda: str
    RispostaAI: str
    DataOra: datetime
