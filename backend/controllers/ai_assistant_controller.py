from fastapi import APIRouter, Depends, Request
from schemas.ai_assistant_schemas import AIAssistantQueryInput, AIAssistantQueryOutput
from services import ai_assistant_service
from dependencies.auth_deps import solo_istruttore
from config.limiter import limiter

router = APIRouter(prefix="/ai_assistant", tags=["ai_assistant"])

# Ogni domanda e' una chiamata a pagamento (o a quota limitata) verso i provider AI:
# il limite evita che un client impazzito o un abuso consumi tutta la quota.
@router.post("/query", response_model=AIAssistantQueryOutput)
@limiter.limit("10/minute")
def interroga_agente(
    request: Request,
    dati: AIAssistantQueryInput,
    utente: dict = Depends(solo_istruttore),
):
    risultato = ai_assistant_service.interroga_agente(
        utente["id_utente"], dati.id_atleta, dati.domanda
    )
    return risultato
