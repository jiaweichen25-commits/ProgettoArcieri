from pydantic import BaseModel
from typing import Optional
from datetime import date

class MaterialeBase(BaseModel):
    riser: Optional[str] = None
    lunghezza_riser: Optional[str] = None
    flettenti: Optional[str] = None
    lunghezza_flettenti: Optional[str] = None
    potenza_nominale: Optional[str] = None
    rest: Optional[str] = None
    mirino: Optional[str] = None
    stabilizzazione: Optional[str] = None
    aste: Optional[str] = None
    lunghezza_aste: Optional[str] = None
    punte: Optional[str] = None
    peso_punte: Optional[str] = None
    cocche: Optional[str] = None
    alette: Optional[str] = None
    lunghezza_alette: Optional[str] = None
    spine: Optional[str] = None
    corda: Optional[str] = None
    fili: Optional[int] = None
    patella: Optional[str] = None
    bottone: Optional[str] = None
    molla: Optional[str] = None
    tiller_superiore: Optional[str] = None
    tiller_inferiore: Optional[str] = None
    brace: Optional[str] = None
    allungo: Optional[str] = None
    potenza_reale: Optional[str] = None
    punto_incocco: Optional[str] = None
    data: date
    materiale_corrente: bool = False

class MaterialeCreate(MaterialeBase):
    pass

class MaterialeUpdate(MaterialeBase):
    pass

class MaterialeOut(MaterialeBase):
    IDmateriale: int
    IDatleta: int
