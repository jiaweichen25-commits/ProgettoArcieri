import httpx

from services.provider_error import ProviderError

_RETRIABLE_STATUS = {429, 500, 502, 503}
_SKIP_STATUS = {400, 401, 403}


def genera_risposta(
    provider: str,
    base_url: str,
    api_key: str,
    model: str,
    system_prompt: str,
    messaggio_utente: str,
    extra_headers: dict | None = None,
) -> str:
    if not api_key:
        raise ProviderError(provider, "API key non configurata")

    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if extra_headers:
        headers.update(extra_headers)

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": messaggio_utente},
        ],
        "temperature": 0.4,
        "max_tokens": 1024,
    }

    try:
        resp = httpx.post(url, headers=headers, json=payload, timeout=30.0)
    except httpx.RequestError as exc:
        raise ProviderError(provider, f"Errore di rete: {exc}") from exc

    if resp.status_code in _SKIP_STATUS:
        raise ProviderError(
            provider,
            f"Errore non recuperabile status={resp.status_code} body={resp.text[:300]}",
            status_code=resp.status_code,
        )

    if resp.status_code != 200:
        retriable = resp.status_code in _RETRIABLE_STATUS
        msg = f"status={resp.status_code} body={resp.text[:300]}"
        if retriable:
            raise ProviderError(provider, msg, status_code=resp.status_code)
        raise ProviderError(
            provider,
            f"Errore non recuperabile {msg}",
            status_code=resp.status_code,
        )

    try:
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise ProviderError(provider, f"Risposta non valida: {exc}") from exc
