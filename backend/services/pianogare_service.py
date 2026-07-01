from fastapi import HTTPException, status
from repositories import pianogare_repository, allenamenti_repository, atleti_repository

def _get_istruttore_or_404(id_utente: int) -> int:
    id_istruttore = atleti_repository.get_id_istruttore_by_utente(id_utente)
    if not id_istruttore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo istruttore non trovato"
        )
    return id_istruttore

def _verifica_allenamento(id_allenamento: int, id_istruttore: int):
    rows = allenamenti_repository.get_allenamenti_by_atleta_istruttore(id_istruttore)
    ids = {row[0] for row in rows}
    if id_allenamento not in ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allenamento non trovato o non appartiene a questo istruttore"
        )

def _row_to_dict(row) -> dict:
    return {
        "IDpianogara":           row[0],
        "IDallenamento":         row[1],
        "id_tipogara":           row[2],
        "tipo_gara":             row[3],
        "data":                  row[4],
        "luogo":                 row[5],
        "distanza":              row[6],
        "note":                  row[7],
        "escludi_visualizzazione": row[8],
    }

def get_gare(id_utente: int, id_allenamento: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_allenamento(id_allenamento, id_istruttore)
    rows = pianogare_repository.get_gare_by_allenamento(id_allenamento)
    return [_row_to_dict(row) for row in rows]

def crea_gara(id_utente: int, id_allenamento: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_allenamento(id_allenamento, id_istruttore)
    new_id = pianogare_repository.crea_gara(id_allenamento, dati)
    return {"IDpianogara": new_id, "message": "Gara aggiunta con successo"}

def modifica_gara(id_utente: int, id_allenamento: int, id_pianogara: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_allenamento(id_allenamento, id_istruttore)
    ok = pianogare_repository.modifica_gara(id_pianogara, id_allenamento, dati)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gara non trovata"
        )
    return {"message": "Gara aggiornata con successo"}

def elimina_gara(id_utente: int, id_allenamento: int, id_pianogara: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_allenamento(id_allenamento, id_istruttore)
    ok = pianogare_repository.elimina_gara(id_pianogara, id_allenamento)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gara non trovata"
        )
    return {"message": "Gara eliminata con successo"}

def get_tipi_gara():
    rows = pianogare_repository.get_tipi_gara()
    return [{"IDtipogara": row[0], "descrizione": row[1], "note": row[2]} for row in rows]

def crea_tipo_gara(descrizione: str):
    descrizione = descrizione.strip()
    if not descrizione:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La descrizione non può essere vuota"
        )
    new_id = pianogare_repository.crea_tipo_gara(descrizione)
    return {"IDtipogara": new_id, "message": "Tipo gara creato con successo"}

def elimina_tipo_gara(id_tipogara: int):
    ok = pianogare_repository.elimina_tipo_gara(id_tipogara)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo gara non trovato"
        )
    return {"message": "Tipo gara eliminato con successo"}