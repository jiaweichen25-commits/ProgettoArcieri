import httpx

from config.settings import GEMINI_API_KEY, GEMINI_MODEL
from services.provider_error import ProviderError

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)


def genera_risposta(system_prompt: str, messaggio_utente: str) -> str:
    if not GEMINI_API_KEY:
        raise ProviderError("gemini", "API key non configurata")

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
    except httpx.RequestError as exc:
        raise ProviderError("gemini", f"Errore di rete: {exc}") from exc

    if resp.status_code != 200:
        print(f"[GEMINI ERROR] status={resp.status_code} body={resp.text[:500]}")
        raise ProviderError(
            "gemini",
            f"status={resp.status_code} body={resp.text[:300]}",
            status_code=resp.status_code,
        )

    try:
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, ValueError) as exc:
        raise ProviderError("gemini", f"Risposta non valida: {exc}") from exc
