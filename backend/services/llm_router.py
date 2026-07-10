from dataclasses import dataclass

from fastapi import HTTPException, status

from config.settings import (
    GEMINI_MODEL,
    GROQ_API_KEY,
    GROQ_MODEL,
    LLM_PROVIDER_ORDER,
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL_ANALISI,
    OPENROUTER_MODEL_DEFAULT,
    OPENROUTER_MODEL_RAGIONAMENTO,
)
from services import gemini_client, openai_compatible_client
from services.provider_error import ProviderError

_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
_GROQ_BASE_URL = "https://api.groq.com/openai/v1"

_TASK_MODEL_MAP = {
    "analisi_dati": OPENROUTER_MODEL_ANALISI,
    "ragionamento_complesso": OPENROUTER_MODEL_RAGIONAMENTO,
    "generale": OPENROUTER_MODEL_DEFAULT,
}


@dataclass
class LLMResult:
    risposta: str
    provider: str
    model: str
    task: str


def _modello_openrouter(task: str) -> str:
    return _TASK_MODEL_MAP.get(task, OPENROUTER_MODEL_DEFAULT)


def _chiama_openrouter(system_prompt: str, messaggio: str, task: str) -> str:
    model = _modello_openrouter(task)
    return openai_compatible_client.genera_risposta(
        provider="openrouter",
        base_url=_OPENROUTER_BASE_URL,
        api_key=OPENROUTER_API_KEY or "",
        model=model,
        system_prompt=system_prompt,
        messaggio_utente=messaggio,
        extra_headers={"HTTP-Referer": "http://localhost:8080"},
    )


def _chiama_groq(system_prompt: str, messaggio: str) -> str:
    return openai_compatible_client.genera_risposta(
        provider="groq",
        base_url=_GROQ_BASE_URL,
        api_key=GROQ_API_KEY or "",
        model=GROQ_MODEL,
        system_prompt=system_prompt,
        messaggio_utente=messaggio,
    )


def _chiama_gemini(system_prompt: str, messaggio: str) -> str:
    return gemini_client.genera_risposta(system_prompt, messaggio)


def genera_risposta(system_prompt: str, messaggio: str, task: str) -> LLMResult:
    ultimo_errore: str | None = None

    for provider in LLM_PROVIDER_ORDER:
        try:
            if provider == "openrouter":
                model = _modello_openrouter(task)
                risposta = _chiama_openrouter(system_prompt, messaggio, task)
            elif provider == "groq":
                model = GROQ_MODEL
                risposta = _chiama_groq(system_prompt, messaggio)
            elif provider == "gemini":
                model = GEMINI_MODEL
                risposta = _chiama_gemini(system_prompt, messaggio)
            else:
                print(f"[LLM] provider sconosciuto ignorato: {provider}")
                continue

            print(f"[LLM] task={task} provider={provider} model={model}")
            return LLMResult(
                risposta=risposta,
                provider=provider,
                model=model,
                task=task,
            )
        except ProviderError as exc:
            ultimo_errore = str(exc)
            print(f"[LLM FALLBACK] {provider} failed: {exc}")
            continue

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=(
            "Tutti i provider AI non sono disponibili, riprova più tardi."
            + (f" Ultimo errore: {ultimo_errore}" if ultimo_errore else "")
        ),
    )
