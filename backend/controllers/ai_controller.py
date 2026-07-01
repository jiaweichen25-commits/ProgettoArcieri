from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from schemas.ai_schemas import DomandaAI, RispostaAI, CronologiaItem
from services import ai_service
from repositories import ai_repository
from dependencies.auth_deps import solo_istruttore, solo_atleta
from typing import List

router = APIRouter(prefix="/ai", tags=["ai"])


# ── ISTRUTTORE ──────────────────────────────────────────────

@router.post("/chiedi", response_model=RispostaAI)
def chiedi_al_coach(payload: DomandaAI, utente: dict = Depends(solo_istruttore)):
    try:
        risposta = ai_service.chiedi_ai(payload.IDatleta, payload.Domanda)
        return {"RispostaAI": risposta}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore comunicazione AI: {str(e)}"
        )


@router.get("/cronologia/{id_atleta}", response_model=List[CronologiaItem])
def get_cronologia(id_atleta: int, utente: dict = Depends(solo_istruttore)):
    return ai_repository.get_cronologia(id_atleta)


# ── ATLETA ──────────────────────────────────────────────────

class DomandaAtleta(BaseModel):
    Domanda: str


@router.post("/atleta/chiedi", response_model=RispostaAI)
def chiedi_coach_atleta(payload: DomandaAtleta, utente: dict = Depends(solo_atleta)):
    try:
        risposta = ai_service.chiedi_ai_atleta(utente["id_utente"], payload.Domanda)
        return {"RispostaAI": risposta}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore comunicazione AI: {str(e)}"
        )


@router.get("/atleta/cronologia", response_model=List[CronologiaItem])
def get_cronologia_atleta(utente: dict = Depends(solo_atleta)):
    id_atleta = ai_repository.get_id_atleta_by_utente(utente["id_utente"])
    if not id_atleta:
        raise HTTPException(status_code=404, detail="Atleta non trovato")
    # Filtra solo le domande fatte dall'atleta — quelle dell'istruttore restano nascoste
    return ai_repository.get_cronologia(id_atleta, solo_ruolo='atleta')
