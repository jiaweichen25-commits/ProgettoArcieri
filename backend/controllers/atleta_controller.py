from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from config.auth_dep import get_current_user
from repositories import atleta_repository, atleti_repository

router = APIRouter(prefix="/atleta", tags=["atleta"])


class NotaCreate(BaseModel):
    nota: str


class MaterialeCreate(BaseModel):
    Riser: Optional[str] = None
    LunghezzaRiser: Optional[str] = None
    Flettenti: Optional[str] = None
    LunghezzaFlettenti: Optional[str] = None
    PotenzaNominale: Optional[str] = None
    Rest: Optional[str] = None
    Mirino: Optional[str] = None
    Stabilizzazione: Optional[str] = None
    Aste: Optional[str] = None
    LunghezzaAste: Optional[str] = None
    Punte: Optional[str] = None
    PesoPunte: Optional[str] = None
    Cocche: Optional[str] = None
    Alette: Optional[str] = None
    LunghezzaAlette: Optional[str] = None
    Spine: Optional[str] = None
    Corda: Optional[str] = None
    Fili: Optional[int] = None
    Patella: Optional[str] = None
    Bottone: Optional[str] = None
    Molla: Optional[str] = None
    TillerSuperiore: Optional[str] = None
    TillerInferiore: Optional[str] = None
    Brace: Optional[str] = None
    Allungo: Optional[str] = None
    PotenzaReale: Optional[str] = None
    PuntoIncocco: Optional[str] = None
    Data: str
    MaterialeCorrente: bool = False


def _check_istr_owns_atleta(istr_email: str, atleta_id: int):
    atleti = atleti_repository.get_atleti_by_istr_email(istr_email)
    if not any(a["IDatleta"] == atleta_id for a in atleti):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questo atleta."
        )


def _get_profile(email: str):
    profile = atleta_repository.get_atleta_by_email(email)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo atleta non trovato. Chiedi al tuo istruttore di creare la tua anagrafica."
        )
    return profile


@router.get("/me")
def get_my_profile(user=Depends(get_current_user)):
    return _get_profile(user["email"])


@router.get("/me/allenamenti")
def get_my_allenamenti(user=Depends(get_current_user)):
    profile = _get_profile(user["email"])
    return atleta_repository.get_allenamenti_atleta(profile["IDatleta"])


@router.get("/me/materiali")
def get_my_materiali(user=Depends(get_current_user)):
    profile = _get_profile(user["email"])
    return atleta_repository.get_materiali_atleta(profile["IDatleta"])


@router.get("/me/allenamenti/{id_allenamento}/settimana/{id_settimana}/note")
def get_note(id_allenamento: int, id_settimana: int, user=Depends(get_current_user)):
    profile = _get_profile(user["email"])
    return atleta_repository.get_note_settimana(profile["IDatleta"], id_allenamento, id_settimana)


@router.post("/me/allenamenti/{id_allenamento}/settimana/{id_settimana}/note",
             status_code=status.HTTP_201_CREATED)
def add_nota(id_allenamento: int, id_settimana: int, body: NotaCreate,
             user=Depends(get_current_user)):
    profile = _get_profile(user["email"])
    new_id = atleta_repository.create_nota(id_allenamento, id_settimana, body.nota)
    return {"IDnota": new_id}


@router.delete("/me/note/{id_nota}", status_code=status.HTTP_204_NO_CONTENT)
def delete_nota(id_nota: int, user=Depends(get_current_user)):
    profile = _get_profile(user["email"])
    atleta_repository.delete_nota(id_nota, profile["IDatleta"])


@router.post("/me/materiali", status_code=status.HTTP_201_CREATED)
def create_materiale(body: MaterialeCreate, user=Depends(get_current_user)):
    profile = _get_profile(user["email"])
    new_id = atleta_repository.create_materiale(profile["IDatleta"], body.model_dump())
    return {"IDmateriale": new_id}


@router.put("/me/materiali/{id_materiale}")
def update_materiale(id_materiale: int, body: MaterialeCreate, user=Depends(get_current_user)):
    profile = _get_profile(user["email"])
    atleta_repository.update_materiale(id_materiale, profile["IDatleta"], body.model_dump())
    return {"ok": True}


@router.delete("/me/materiali/{id_materiale}", status_code=status.HTTP_204_NO_CONTENT)
def delete_materiale(id_materiale: int, user=Depends(get_current_user)):
    profile = _get_profile(user["email"])
    atleta_repository.delete_materiale(id_materiale, profile["IDatleta"])


# ── Endpoint istruttore: gestione materiali per un atleta ───────────────────

@router.get("/istruttore/atleti/{atleta_id}/materiali")
def get_materiali_istr(atleta_id: int, user=Depends(get_current_user)):
    if user["ruolo"] != "istruttore":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accesso riservato agli istruttori.")
    _check_istr_owns_atleta(user["email"], atleta_id)
    return atleta_repository.get_materiali_atleta(atleta_id)


@router.post("/istruttore/atleti/{atleta_id}/materiali", status_code=status.HTTP_201_CREATED)
def create_materiale_istr(atleta_id: int, body: MaterialeCreate, user=Depends(get_current_user)):
    if user["ruolo"] != "istruttore":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    _check_istr_owns_atleta(user["email"], atleta_id)
    new_id = atleta_repository.create_materiale(atleta_id, body.model_dump())
    return {"IDmateriale": new_id}


@router.put("/istruttore/atleti/{atleta_id}/materiali/{id_materiale}")
def update_materiale_istr(atleta_id: int, id_materiale: int, body: MaterialeCreate, user=Depends(get_current_user)):
    if user["ruolo"] != "istruttore":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    _check_istr_owns_atleta(user["email"], atleta_id)
    atleta_repository.update_materiale(id_materiale, atleta_id, body.model_dump())
    return {"ok": True}


@router.delete("/istruttore/atleti/{atleta_id}/materiali/{id_materiale}", status_code=status.HTTP_204_NO_CONTENT)
def delete_materiale_istr(atleta_id: int, id_materiale: int, user=Depends(get_current_user)):
    if user["ruolo"] != "istruttore":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    _check_istr_owns_atleta(user["email"], atleta_id)
    atleta_repository.delete_materiale(id_materiale, atleta_id)
