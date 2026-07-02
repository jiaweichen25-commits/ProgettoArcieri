from fastapi import APIRouter, Depends
from schemas.coach_schemas import CoachQueryInput, CoachQueryOutput
from services import coach_service
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/coach", tags=["coach ai"])

@router.post("/query", response_model=CoachQueryOutput)
def interroga_agente(
    dati: CoachQueryInput,
    utente: dict = Depends(solo_istruttore),
):
    risultato = coach_service.interroga_agente(
        utente["id_utente"], dati.id_atleta, dati.domanda
    )
    return risultato
