import httpx
from fastapi import HTTPException, status
from config.settings import GEMINI_API_KEY, GEMINI_MODEL

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)

def genera_risposta(system_prompt: str, messaggio_utente: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servizio AI non configurato. Contatta l'amministratore.",
        )

    url = _GEMINI_URL.format(model=GEMINI_MODEL)
    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": messaggio_utente}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1024},
    }

    try:
        resp = httpx.post(
            url,
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=30.0,
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servizio AI non raggiungibile, riprova più tardi.",
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Il servizio AI ha restituito un errore, riprova più tardi.",
        )

    try:
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Risposta AI non valida, riprova più tardi.",
        )
