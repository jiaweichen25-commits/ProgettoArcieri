from fastapi import HTTPException, status
from repositories import atleti_repository, materiali_repository
from services.materiali_service import _row_to_dict as _materiale_row_to_dict

def _atleta_row_to_dict(row) -> dict:
    return {
        "IDatleta": row[0],
        "nome": row[1],
        "cognome": row[2],
        "codice_fiscale": row[3],
        "data_nascita": row[4],
        "telefono": row[5],
        "cellulare": row[6],
        "email": row[7],
        "indirizzo": row[8],
        "cap": str(row[9]) if row[9] is not None else None,
        "citta": row[10],
    }

def _get_atleta_or_404(id_utente: int) -> dict:
    row = atleti_repository.get_atleta_by_id_utente(id_utente)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo atleta non trovato"
        )
    return _atleta_row_to_dict(row)

def get_profilo(id_utente: int):
    return _get_atleta_or_404(id_utente)

def get_materiali(id_utente: int):
    atleta = _get_atleta_or_404(id_utente)
    rows = materiali_repository.get_materiali_by_atleta(atleta["IDatleta"])
    return [_materiale_row_to_dict(row) for row in rows]

def get_allenamenti(id_utente: int):
    _get_atleta_or_404(id_utente)
    return []
