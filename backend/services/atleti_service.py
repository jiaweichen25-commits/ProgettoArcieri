from fastapi import HTTPException, status
from repositories import atleti_repository, user_repository
import bcrypt

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
        "cap":            str(row[9]) if row[9] is not None else None,
        "citta":          row[10],
    }

# --- LOGICA DI BUSINESS PRINCIPALE ---

def get_atleti(id_utente: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    rows = atleti_repository.get_atleti_by_istruttore(id_istruttore)
    return [_row_to_dict(row) for row in rows]

def crea_atleta(id_utente: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)

    # Registra automaticamente l'utente atleta con password temporanea
    email_atleta = dati.get("email")
    if not email_atleta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'email dell'atleta è obbligatoria"
        )

    # Controlla se esiste già un atleta con questa email per questo istruttore
    atleti_esistenti = atleti_repository.get_atleti_by_istruttore(id_istruttore)
    for row in atleti_esistenti:
        if row[7] and row[7].lower() == email_atleta.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esiste già un atleta con questa email"
            )

    # Controlla se esiste già un account con questa email
    existing = user_repository.get_user_by_email(email_atleta)
    if existing:
        if existing[1] != "atleta":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Questa email è già registrata come istruttore"
            )
        id_utente_atleta = existing[2]
    else:
        # Crea account con password temporanea
        password_temp = "123456"
        hashed = bcrypt.hashpw(password_temp.encode(), bcrypt.gensalt()).decode()
        user_repository.create_user(email_atleta, hashed, "atleta")
        nuovo_utente = user_repository.get_user_by_email(email_atleta)
        id_utente_atleta = nuovo_utente[2]

    new_id = atleti_repository.crea_atleta(id_istruttore, id_utente_atleta, dati)
    return {"IDatleta": new_id, "message": "Atleta creato con successo"}

def modifica_atleta(id_atleta: int, id_utente: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    
    try:
        ok = atleti_repository.modifica_atleta(id_atleta, id_istruttore, dati)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atleta non trovato o non appartiene a questo istruttore"
        )
    return {"message": "Atleta aggiornato con successo"}

def elimina_atleta(id_atleta: int, id_utente: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    
    id_utente_atleta = atleti_repository.elimina_atleta(id_atleta, id_istruttore)
    if not id_utente_atleta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atleta non trovato o non appartiene a questo istruttore"
        )
        
    user_repository.delete_user(id_utente_atleta)
    return {"message": "Atleta eliminato con successo"}

