from pydantic import BaseModel, EmailStr, field_validator

class LoginInput(BaseModel):
    email : str
    password : str

class TokenOutput(BaseModel):
    access_token: str
    token_type : str

class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    ruolo: str

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
