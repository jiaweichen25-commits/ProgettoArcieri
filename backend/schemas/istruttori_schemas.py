from pydantic import BaseModel
from typing import Optional

class IstruttoreUpdate(BaseModel):
    Nome:      Optional[str] = None
    Cognome:   Optional[str] = None
    Qualifica: Optional[str] = None
    Cellulare: Optional[str] = None
    Stato:     Optional[str] = "Attivo"
