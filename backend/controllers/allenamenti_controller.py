from fastapi import APIRouter, Depends
from config.auth_dep import get_current_user
from schemas.allenamenti_schemas import AllenamentoCreate
from repositories import allenamenti_repository, istruttori_repository

router = APIRouter(prefix="/allenamenti", tags=["allenamenti"])


@router.get("/{atleta_id}")
def get_allenamenti(atleta_id: int, user=Depends(get_current_user)):
    istr_id = istruttori_repository.get_istruttore_id_by_email(user["email"])
    if not istr_id:
        return []
    return allenamenti_repository.get_allenamenti_by_atleta(atleta_id, istr_id)


@router.post("")
def create_allenamento(data: AllenamentoCreate, user=Depends(get_current_user)):
    new_id = allenamenti_repository.create_allenamento(
        atleta_id=data.IDatleta,
        data_inizio=data.DataInizio,
        data_fine=data.DataFine,
        obiettivi=data.Obiettivi,
    )
    return {"IDallenamento": new_id}
