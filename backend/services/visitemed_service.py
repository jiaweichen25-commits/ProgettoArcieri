from fastapi import HTTPException, status
from repositories import visitemed_repository, atleti_repository

def _get_istruttore_or_404(id_utente: int) -> int:
    id_istruttore = atleti_repository.get_id_istruttore_by_utente(id_utente)
    if not id_istruttore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo istruttore non trovato"
        )
    return id_istruttore

def _verifica_atleta(id_atleta: int, id_istruttore: int):
    atleti = atleti_repository.get_atleti_by_istruttore(id_istruttore)
    ids = {row[0] for row in atleti}
    if id_atleta not in ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atleta non trovato o non appartiene a questo istruttore"
        )

def _row_to_dict(row) -> dict:
    return {
        "IDvisita":      row[0],
        "IDatleta":      row[1],
        "data_visita":   row[2],
        "data_scadenza": row[3],
    }

def get_visite(id_utente: int, id_atleta: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    rows = visitemed_repository.get_visite_by_atleta(id_atleta)
    return [_row_to_dict(row) for row in rows]

def crea_visita(id_utente: int, id_atleta: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    new_id = visitemed_repository.crea_visita(id_atleta, dati)
    return {"IDvisita": new_id, "message": "Visita creata con successo"}

def modifica_visita(id_utente: int, id_atleta: int, id_visita: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    ok = visitemed_repository.modifica_visita(id_visita, id_atleta, dati)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita non trovata"
        )
    return {"message": "Visita aggiornata con successo"}

def elimina_visita(id_utente: int, id_atleta: int, id_visita: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    ok = visitemed_repository.elimina_visita(id_visita, id_atleta)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita non trovata"
        )
    return {"message": "Visita eliminata con successo"}