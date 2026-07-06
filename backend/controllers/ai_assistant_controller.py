from fastapi import APIRouter, Depends
from schemas.ai_assistant_schemas import AIAssistantQueryInput, AIAssistantQueryOutput
from services import ai_assistant_service
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/ai_assistant", tags=["ai_assistant"])

@router.post("/query", response_model=AIAssistantQueryOutput)
def interroga_agente(
    dati: AIAssistantQueryInput,
    utente: dict = Depends(solo_istruttore),
):
    risultato = ai_assistant_service.interroga_agente(
        utente["id_utente"], dati.id_atleta, dati.domanda
    )
    return risultato
