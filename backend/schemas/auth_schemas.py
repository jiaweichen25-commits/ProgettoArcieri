from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional

class LoginInput(BaseModel):
    email : str
    password : str
    portale: str

    @field_validator("portale")
    @classmethod
    def portale_valido(cls, v):
        if v not in ("atleta", "istruttore"):
            raise ValueError("Portale deve essere 'atleta' o 'istruttore'")
        return v

class TokenOutput(BaseModel):
    access_token: str
    token_type : str

class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    ruolo: str
    nome: Optional[str] = None
    cognome: Optional[str] = None
    qualifica: Optional[str] = None

    @field_validator("ruolo")
    @classmethod
    def ruolo_valido(cls, v):
        if v not in ("atleta", "istruttore"):
            raise ValueError("Ruolo deve essere 'atleta' o 'istruttore'")
        return v

    @field_validator("password")
    @classmethod
    def password_lunghezza(cls, v):
        if len(v) < 6:
            raise ValueError("La password deve essere di almeno 6 caratteri")
        return v

    @model_validator(mode="after")
    def istruttore_richiede_anagrafica(self):
        if self.ruolo == "istruttore":
            if not self.nome or not self.nome.strip():
                raise ValueError("Il nome è obbligatorio per la registrazione istruttore")
            if not self.cognome or not self.cognome.strip():
                raise ValueError("Il cognome è obbligatorio per la registrazione istruttore")
        return self
