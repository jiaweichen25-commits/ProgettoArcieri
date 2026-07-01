from pydantic import BaseModel
from datetime import datetime

class RichiestaMessaggioAI(BaseModel):
    """
    Schema for validating incoming AI chat requests.
    Validazione dei dati inviati dal frontend.
    """
    IDatleta: int
    RuoloUtente: str  # Must be 'istruttore' or 'atleta'
    Domanda: str

class RispostaMessaggioAI(BaseModel):
    """
    Schema for validating outgoing AI chat responses.
    Validazione dei dati restituiti al frontend.
    """
    IDconversazione: int
    IDatleta: int
    RuoloUtente: str
    Domanda: str
    RispostaAI: str
    DataOra: datetime

    class Config:
        from_attributes = True  # Allows compatibility with SQLAlchemy ORM models
