import time

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)


def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    # Risposta 429 con i secondi che mancano davvero allo sblocco.
    # Quella di slowapi non ha Retry-After (servirebbe headers_enabled, che pero' vuole
    # un parametro `response` in ogni endpoint) e mette il messaggio in "error" invece di "detail".
    limite, chiavi = request.state.view_rate_limit
    reset_alle, _ = limiter.limiter.get_window_stats(limite, *chiavi)
    secondi = max(1, int(reset_alle - time.time()) + 1)
    return JSONResponse(
        {"detail": f"Troppi tentativi. Riprova tra {secondi} secondi."},
        status_code=429,
        headers={"Retry-After": str(secondi)},
    )
