from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class AtletaCreate(BaseModel):
    Nome:           str
    Cognome:        str
    Indirizzo:      Optional[str] = None
    CAP:            Optional[str] = None
    CITTA:          Optional[str] = None
    Codice_Fiscale: Optional[str] = None
    Telefono:       Optional[str] = None
    Cellulare:      Optional[str] = None
    email:          Optional[str] = Field(None, alias="E-mail")
    DataNascita:    Optional[date] = None

    model_config = {"populate_by_name": True}

class AtletaUpdate(BaseModel):
    Nome:           Optional[str] = None
    Cognome:        Optional[str] = None
    Indirizzo:      Optional[str] = None
    CAP:            Optional[str] = None
    CITTA:          Optional[str] = None
    Codice_Fiscale: Optional[str] = None
    Telefono:       Optional[str] = None
    Cellulare:      Optional[str] = None
    email:          Optional[str] = Field(None, alias="E-mail")
    DataNascita:    Optional[date] = None

    model_config = {"populate_by_name": True}
