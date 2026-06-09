from fastapi import APIRouter, Depends
from config.auth_dep import get_current_user
from schemas.istruttori_schemas import IstruttoreUpdate
from repositories import istruttori_repository

router = APIRouter(prefix="/istruttori", tags=["istruttori"])


@router.get("")
def get_istruttori(user=Depends(get_current_user)):
    return istruttori_repository.get_all_istruttori_with_atleti()


@router.put("/me")
def update_my_profile(data: IstruttoreUpdate, user=Depends(get_current_user)):
    istruttori_repository.update_istruttore(
        email=user["email"],
        nome=data.Nome or "",
        cognome=data.Cognome or "",
        qualifica=data.Qualifica or "",
        cellulare=data.Cellulare or "",
        stato=data.Stato or "Attivo",
    )
    return {"ok": True}
