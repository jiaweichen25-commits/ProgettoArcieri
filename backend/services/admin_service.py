from fastapi import HTTPException, status
from repositories import user_repository, atleti_repository
from config.database import get_db_conn
import string
import random
import bcrypt
from services.email_service import invia_email_credenziali
from datetime import datetime

def get_all_istruttori():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT i."IDistruttore", i."Nome", i."Cognome", i."Qualifica", i."E-mail", 
                       u."IDutente", u.sospeso_fino_al, u."Username"
                FROM "Tistruttori" i
                JOIN "Tutenti" u ON i."IDutente" = u."IDutente"
            ''')
            rows = cur.fetchall()
            return [{
                "IDistruttore": r[0],
                "Nome": r[1],
                "Cognome": r[2],
                "Qualifica": r[3],
                "E-mail": r[4],
                "IDutente": r[5],
                "sospeso_fino_al": r[6].isoformat() if r[6] else None,
                "Username": r[7]
            } for r in rows]
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

def update_istruttore(id_istruttore: int, dati: dict):
    try:
        user_repository.update_istruttore_details(
            id_istruttore=id_istruttore,
            nome=dati.get("nome", "").strip(),
            cognome=dati.get("cognome", "").strip(),
            email=dati.get("email", "").strip(),
            qualifica=dati.get("qualifica", "").strip(),
            username=dati.get("username", "").strip() or None
        )
        return {"message": "Istruttore aggiornato con successo"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

def delete_istruttore(id_istruttore: int):
    try:
        user_repository.delete_istruttore(id_istruttore)
        return {"message": "Istruttore eliminato con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Errore durante l'eliminazione")

def suspend_istruttore(id_istruttore: int, data_fine_sospensione: str):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDutente" FROM "Tistruttori" WHERE "IDistruttore" = %s', (id_istruttore,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Istruttore non trovato")
            id_utente = row[0]
            
        user_repository.suspend_user(id_utente, data_fine_sospensione if data_fine_sospensione else None)
        return {"message": "Stato sospensione aggiornato con successo"}
    finally:
        conn.close()

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
