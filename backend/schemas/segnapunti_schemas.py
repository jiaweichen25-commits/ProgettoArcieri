from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date


VALORI_VALIDI = {"X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"}


class VoleeIn(BaseModel):
    mezza: int
    numero: int
    f1: Optional[str] = None
    f2: Optional[str] = None
    f3: Optional[str] = None
    f4: Optional[str] = None
    f5: Optional[str] = None
    f6: Optional[str] = None

    @field_validator("f1", "f2", "f3", "f4", "f5", "f6", mode="before")
    @classmethod
    def valida_freccia(cls, v):
        if v is None or v == "":
            return None
        if v not in VALORI_VALIDI:
            raise ValueError(f"Valore freccia non valido: '{v}'. Valori ammessi: X, 10..1, M")
        return v


class VoleeOut(BaseModel):
    IDvolee: int
    IDsegnapunto: int
    mezza: int
    numero: int
    f1: Optional[str] = None
    f2: Optional[str] = None
    f3: Optional[str] = None
    f4: Optional[str] = None
    f5: Optional[str] = None
    f6: Optional[str] = None
    somma: Optional[int] = None
    totale: Optional[int] = None


class SegnapuntoCreate(BaseModel):
    data: date
    distanza: str
    frecce_per_volee: int = 3
    note_istruttore: Optional[str] = None
    note_atleta: Optional[str] = None

    @field_validator("frecce_per_volee")
    @classmethod
    def valida_frecce(cls, v):
        if v not in (3, 6):
            raise ValueError("frecce_per_volee deve essere 3 o 6")
        return v


class SegnapuntoUpdate(BaseModel):
    note_istruttore: Optional[str] = None
    note_atleta: Optional[str] = None
    ImpattiBersaglio: Optional[list] = None


class SegnapuntoOut(BaseModel):
    IDsegnapunto: int
    IDatleta: int
    data: date
    distanza: str
    frecce_per_volee: int
    note_istruttore: Optional[str] = None
    note_atleta: Optional[str] = None
    ImpattiBersaglio: Optional[list] = None