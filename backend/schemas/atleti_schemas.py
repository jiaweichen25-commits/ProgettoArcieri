from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

# --- INPUT: dati che arrivano dal frontend ---

class AtletaCreate(BaseModel):
    id_utente_atleta: int
    nome: str
    cognome: str
    codice_fiscale: str
    data_nascita: Optional[date] = None
    telefono: Optional[str] = None
    cellulare: Optional[str] = None
    email: Optional[EmailStr] = None
    indirizzo: Optional[str] = None
    cap: Optional[str] = None  
    citta: Optional[str] = None

class AtletaUpdate(BaseModel):
    nome: str
    cognome: str
    codice_fiscale: str
    data_nascita: Optional[date] = None
    telefono: Optional[str] = None
    cellulare: Optional[str] = None
    email: Optional[EmailStr] = None
    indirizzo: Optional[str] = None
    cap: Optional[str] = None  
    citta: Optional[str] = None

# --- OUTPUT: dati che mandiamo al frontend ---

class AtletaOut(BaseModel):
    IDatleta: int
    nome: str
    cognome: str
    codice_fiscale: str
    data_nascita: Optional[date] = None  
    telefono: Optional[str] = None
    cellulare: Optional[str] = None
    email: Optional[EmailStr] = None    
    indirizzo: Optional[str] = None
    cap: Optional[str] = None            
    citta: Optional[str] = None