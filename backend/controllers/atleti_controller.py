from fastapi import APIRouter, Depends, HTTPException, status
from config.auth_dep import get_current_user
from schemas.atleti_schemas import AtletaCreate, AtletaUpdate
from repositories import atleti_repository, istruttori_repository

router = APIRouter(prefix="/atleti", tags=["atleti"])


def _get_istr_id(email: str) -> int:
    istr_id = istruttori_repository.get_istruttore_id_by_email(email)
    if not istr_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profilo istruttore non trovato. Completa il profilo prima."
        )
    return istr_id


@router.get("/miei")
def get_miei_atleti(user=Depends(get_current_user)):
    return atleti_repository.get_atleti_by_istr_email(user["email"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_atleta(data: AtletaCreate, user=Depends(get_current_user)):
    istr_id = _get_istr_id(user["email"])
    new_id = atleti_repository.create_atleta(
        istr_id=istr_id,
        nome=data.Nome,
        cognome=data.Cognome,
        indirizzo=data.Indirizzo,
        cap=data.CAP,
        citta=data.CITTA,
        cf=data.Codice_Fiscale,
        telefono=data.Telefono,
        cellulare=data.Cellulare,
        email=data.email,
        data_nascita=data.DataNascita,
    )
    return {"IDatleta": new_id}


@router.put("/{atleta_id}")
def update_atleta(atleta_id: int, data: AtletaUpdate, user=Depends(get_current_user)):
    istr_id = _get_istr_id(user["email"])
    atleti_repository.update_atleta(
        atleta_id=atleta_id,
        istr_id=istr_id,
        nome=data.Nome,
        cognome=data.Cognome,
        indirizzo=data.Indirizzo,
        cap=data.CAP,
        citta=data.CITTA,
        cf=data.Codice_Fiscale,
        telefono=data.Telefono,
        cellulare=data.Cellulare,
        email=data.email,
        data_nascita=data.DataNascita,
    )
    return {"ok": True}


@router.delete("/{atleta_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_atleta(atleta_id: int, user=Depends(get_current_user)):
    istr_id = _get_istr_id(user["email"])
    atleti_repository.delete_atleta(atleta_id, istr_id)
