from fastapi import Request
from fastapi.responses import JSONResponse
from psycopg2 import errors


def db_error_handler(request: Request, exc: Exception) -> JSONResponse:
    # Errori del database non gestiti dai service: senza questo handler diventano 500.
    # Nel log solo tipo e vincolo/colonna, non il messaggio completo (contiene i valori, es. email).
    vincolo = exc.diag.constraint_name or exc.diag.column_name or ""
    print(f"[DB] {request.method} {request.url.path}: {type(exc).__name__} {vincolo}", flush=True)

    if isinstance(exc, errors.UniqueViolation):
        return JSONResponse({"detail": "Esiste già un elemento con questi dati."}, status_code=409)
    if isinstance(exc, errors.ForeignKeyViolation):
        return JSONResponse(
            {"detail": "Operazione non possibile: il dato è in uso altrove, "
                       "oppure fa riferimento a qualcosa che non esiste."},
            status_code=409,
        )
    if isinstance(exc, errors.NotNullViolation):
        return JSONResponse({"detail": f"Manca un campo obbligatorio: {exc.diag.column_name}"}, status_code=422)
    # Altri IntegrityError (CHECK) e DataError (testo troppo lungo, data scritta male, numero fuori range)
    return JSONResponse({"detail": "Valore non valido (formato sbagliato o testo troppo lungo)."}, status_code=422)
