from fastapi import HTTPException, status
from repositories import user_repository, atleti_repository
from config.database import get_db_conn
import string
import random
import bcrypt
from services.email_service import invia_email_credenziali

def get_all_istruttori():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDistruttore", "Nome", "Cognome", "Qualifica", "E-mail" FROM "Tistruttori"')
            rows = cur.fetchall()
            return [{"IDistruttore": r[0], "Nome": r[1], "Cognome": r[2], "Qualifica": r[3], "E-mail": r[4]} for r in rows]
    finally:
        conn.close()

def create_istruttore(dati: dict):
    email = dati.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="L'email è obbligatoria")
        
    existing = user_repository.get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=400, detail="Esiste già un utente con questa email")
        
    chars = string.ascii_letters + string.digits
    password_temp = ''.join(random.choice(chars) for _ in range(8))
    hashed = bcrypt.hashpw(password_temp.encode(), bcrypt.gensalt()).decode()
    
    user_repository.create_user(email, hashed, "istruttore", must_change_password=True)
    new_user = user_repository.get_user_by_email(email)
    id_utente = new_user[2]
    
    user_repository.create_istruttore(
        id_utente,
        dati.get("nome", "").strip(),
        dati.get("cognome", "").strip(),
        email,
        dati.get("qualifica", "").strip()
    )
    
    invia_email_credenziali(email, password_temp, "istruttore")
    return {"message": "Istruttore creato con successo"}

def get_atleti_by_istruttore_admin(id_istruttore: int):
    # Riprendiamo la logica di atleti_repository
    rows = atleti_repository.get_atleti_by_istruttore(id_istruttore)
    def row_to_dict(row):
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
    return [row_to_dict(row) for row in rows]
