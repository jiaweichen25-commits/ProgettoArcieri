from fastapi import HTTPException, status
from repositories import allenamenti_repository, atleti_repository

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
        "IDallenamento": row[0],
        "IDatleta":      row[1],
        "data_inizio":   row[2],
        "data_fine":     row[3],
        "obiettivi":     row[4],
    }

def get_allenamenti(id_utente: int, id_atleta: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    rows = allenamenti_repository.get_allenamenti_by_atleta(id_atleta)
    return [_row_to_dict(row) for row in rows]

def crea_allenamento(id_utente: int, id_atleta: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    if dati.get("data_fine") <= dati.get("data_inizio"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La data di fine deve essere successiva alla data di inizio"
        )
    new_id = allenamenti_repository.crea_allenamento(id_atleta, dati)
    return {"IDallenamento": new_id, "message": "Allenamento creato con successo"}

def modifica_allenamento(id_utente: int, id_atleta: int, id_allenamento: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    if dati.get("data_fine") <= dati.get("data_inizio"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La data di fine deve essere successiva alla data di inizio"
        )
    ok = allenamenti_repository.modifica_allenamento(id_allenamento, id_atleta, dati)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allenamento non trovato"
        )
    return {"message": "Allenamento aggiornato con successo"}

def elimina_allenamento(id_utente: int, id_atleta: int, id_allenamento: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    ok = allenamenti_repository.elimina_allenamento(id_allenamento, id_atleta)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allenamento non trovato"
        )
    return {"message": "Allenamento eliminato con successo"}