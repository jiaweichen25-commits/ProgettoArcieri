from fastapi import APIRouter, Depends, status
from dependencies.auth_deps import solo_admin
from services import admin_service
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/admin", tags=["admin"])

class IstruttoreCreateInput(BaseModel):
    nome: str
    cognome: str
    email: EmailStr
    qualifica: str = None

@router.get("/istruttori")
def get_istruttori(utente: dict = Depends(solo_admin)):
    return admin_service.get_all_istruttori()

@router.post("/istruttori", status_code=status.HTTP_201_CREATED)
def create_istruttore(data: IstruttoreCreateInput, utente: dict = Depends(solo_admin)):
    return admin_service.create_istruttore(data.dict())

@router.get("/istruttori/{id_istruttore}/atleti")
def get_atleti_di_istruttore(id_istruttore: int, utente: dict = Depends(solo_admin)):
    return admin_service.get_atleti_by_istruttore_admin(id_istruttore)
