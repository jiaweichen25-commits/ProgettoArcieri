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

class IstruttoreUpdateInput(BaseModel):
    nome: str
    cognome: str
    email: EmailStr
    qualifica: str = None
    username: str = None

class SuspendInput(BaseModel):
    data_fine_sospensione: str = None

@router.get("/istruttori/{id_istruttore}/atleti")
def get_atleti_di_istruttore(id_istruttore: int, utente: dict = Depends(solo_admin)):
    return admin_service.get_atleti_by_istruttore_admin(id_istruttore)

@router.put("/istruttori/{id_istruttore}")
def update_istruttore(id_istruttore: int, data: IstruttoreUpdateInput, utente: dict = Depends(solo_admin)):
    return admin_service.update_istruttore(id_istruttore, data.dict())

@router.delete("/istruttori/{id_istruttore}")
def delete_istruttore(id_istruttore: int, utente: dict = Depends(solo_admin)):
    return admin_service.delete_istruttore(id_istruttore)

@router.put("/istruttori/{id_istruttore}/sospendi")
def suspend_istruttore(id_istruttore: int, data: SuspendInput, utente: dict = Depends(solo_admin)):
    return admin_service.suspend_istruttore(id_istruttore, data.data_fine_sospensione)
