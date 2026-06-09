from fastapi import HTTPException, status
from repositories import atleti_repository

# --- FUNZIONI UTILITÀ PRIVATE ---

def _get_istruttore_or_404(id_utente: int) -> int:
    """Verifica l'esistenza dell'istruttore e restituisce il suo ID, altrimenti lancia 404."""
    id_istruttore = atleti_repository.get_id_istruttore_by_utente(id_utente)
    if not id_istruttore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo istruttore non trovato"
        )
    return id_istruttore

def _row_to_dict(row) -> dict:
    """Mappa la tupla del DB. Al resto (date, stringhe) ci pensa Pydantic."""
    return {
        "IDatleta":       row[0],
        "nome":           row[1],
        "cognome":        row[2],
        "codice_fiscale": row[3],
        "data_nascita":   row[4],  
        "telefono":       row[5],
        "cellulare":      row[6],
        "email":          row[7],
        "indirizzo":      row[8],
        "cap":            row[9],
        "citta":          row[10],
    }

# --- LOGICA DI BUSINESS PRINCIPALE ---

def get_atleti(id_utente: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    rows = atleti_repository.get_atleti_by_istruttore(id_istruttore)
    return [_row_to_dict(row) for row in rows]

def crea_atleta(id_utente: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    
    id_utente_atleta = dati.get("id_utente_atleta")
    if id_utente_atleta is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="id_utente_atleta è obbligatorio"
        )
        
    new_id = atleti_repository.crea_atleta(id_istruttore, id_utente_atleta, dati)
    return {"IDatleta": new_id, "message": "Atleta creato con successo"}

def modifica_atleta(id_atleta: int, id_utente: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    
    ok = atleti_repository.modifica_atleta(id_atleta, id_istruttore, dati)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atleta non trovato o non appartiene a questo istruttore"
        )
    return {"message": "Atleta aggiornato con successo"}

def elimina_atleta(id_atleta: int, id_utente: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    
    ok = atleti_repository.elimina_atleta(id_atleta, id_istruttore)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atleta non trovato o non appartiene a questo istruttore"
        )
    return {"message": "Atleta eliminato con successo"}

