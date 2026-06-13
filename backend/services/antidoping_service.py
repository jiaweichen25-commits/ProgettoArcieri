from fastapi import HTTPException, status
from repositories import antidoping_repository, atleti_repository

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
        "IDantidoping":           row[0],
        "IDatleta":               row[1],
        "anno":                   row[2],
        "autorizzazione_fitarco": row[3],
        "scadenza_autorizzazione": row[4],
    }

def get_antidoping(id_utente: int, id_atleta: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    rows = antidoping_repository.get_antidoping_by_atleta(id_atleta)
    return [_row_to_dict(row) for row in rows]

def crea_antidoping(id_utente: int, id_atleta: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    new_id = antidoping_repository.crea_antidoping(id_atleta, dati)
    return {"IDantidoping": new_id, "message": "Record antidoping creato con successo"}

def modifica_antidoping(id_utente: int, id_atleta: int, id_antidoping: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    ok = antidoping_repository.modifica_antidoping(id_antidoping, id_atleta, dati)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record antidoping non trovato"
        )
    return {"message": "Record antidoping aggiornato con successo"}

def elimina_antidoping(id_utente: int, id_atleta: int, id_antidoping: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    ok = antidoping_repository.elimina_antidoping(id_antidoping, id_atleta)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record antidoping non trovato"
        )
    return {"message": "Record antidoping eliminato con successo"}