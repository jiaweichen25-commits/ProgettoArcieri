from datetime import datetime, timedelta
from jose import jwt
import bcrypt
import random
import re
from fastapi import HTTPException, status
from config.settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from repositories import user_repository
from services.email_service import invia_email_recupero_password

# Costanti per il rate limiting
MAX_TENTATIVI = 5
LOCKOUT_MINUTI = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(email: str, password: str, portale: str):
    # Indici tuple dal repository aggiornato:
    # [0]=passwd_hash, [1]=Ruolo, [2]=IDutente, [3]=must_change_password,
    # [4]=sospeso_fino_al, [5]=E-mail, [6]=Username, [7]=tentativi_falliti,
    # [8]=bloccato_fino_al
    user = user_repository.get_user_by_email_or_username(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")

    id_utente = user[2]
    must_change = user[3] if len(user) > 3 else False
    sospeso_fino_al = user[4] if len(user) > 4 else None
    tentativi_falliti = user[7] if len(user) > 7 else 0
    bloccato_fino_al = user[8] if len(user) > 8 else None

    # ── Controllo blocco per troppi tentativi ──
    if bloccato_fino_al:
        if isinstance(bloccato_fino_al, str):
            bloccato_fino_al = datetime.strptime(bloccato_fino_al, "%Y-%m-%d %H:%M:%S")
        if bloccato_fino_al > datetime.now():
            minuti_rimanenti = int((bloccato_fino_al - datetime.now()).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account bloccato per troppi tentativi falliti. Riprova tra {minuti_rimanenti} minuti."
            )
        else:
            # Il blocco è scaduto, reset dei tentativi
            user_repository.reset_failed_attempts(id_utente)
            tentativi_falliti = 0

    # ── Controllo sospensione account ──
    if sospeso_fino_al:
        if isinstance(sospeso_fino_al, str):
            sospeso_fino_al = datetime.strptime(sospeso_fino_al, "%Y-%m-%d").date()
        if sospeso_fino_al >= datetime.now().date():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Account sospeso fino al {sospeso_fino_al}")

    # Se il portale è istruttore, un admin può loggarsi qui se vogliamo? 
    # Il frontend dovrebbe inviare portale=admin, non istruttore, se è admin.
    if user[1] != portale:
        # Se un admin cerca di accedere dal portale istruttore, lo autorizziamo ma cambiamo il ruolo nel token
        # oppure frontend manderà 'admin' come portale
        if not (portale == "istruttore" and user[1] == "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accesso non autorizzato per questo portale"
            )

    # ── Verifica password con gestione tentativi ──
    if not bcrypt.checkpw(password.encode(), user[0].encode()):
        tentativi_falliti += 1
        if tentativi_falliti >= MAX_TENTATIVI:
            lock_until = datetime.now() + timedelta(minutes=LOCKOUT_MINUTI)
            user_repository.increment_failed_attempts(id_utente, lock_until=lock_until)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account bloccato per {LOCKOUT_MINUTI} minuti dopo {MAX_TENTATIVI} tentativi falliti."
            )
        else:
            user_repository.increment_failed_attempts(id_utente)
            rimanenti = MAX_TENTATIVI - tentativi_falliti
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Credenziali non valide. Tentativi rimanenti: {rimanenti}/{MAX_TENTATIVI}"
            )

    # ── Login riuscito: reset contatore ──
    if tentativi_falliti > 0:
        user_repository.reset_failed_attempts(id_utente)

    actual_email = user[5] if len(user) > 5 and user[5] else email
    token = create_access_token({"sub": actual_email, "ruolo": user[1], "id_utente": user[2], "must_change_password": must_change})
    return token, must_change

def register_user(email: str, password: str, ruolo: str, nome: str = None, cognome: str = None, qualifica: str = None):
    existing_user = user_repository.get_user_by_email_or_username(email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email già registrata")
        
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    try:
        user_repository.create_user(email, hashed, ruolo)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email già registrata")
    
    new_user = user_repository.get_user_by_email_or_username(email)
    id_utente = new_user[2]

    if ruolo == "istruttore":
        user_repository.create_istruttore(
            id_utente,
            nome.strip(),
            cognome.strip(),
            email,
            qualifica.strip() if qualifica else None,
        )

    token = create_access_token({"sub": email, "ruolo": ruolo, "id_utente": id_utente, "must_change_password": False})
    return token

def change_user_password(email: str, old_password: str, new_password: str):
    user = user_repository.get_user_by_email_or_username(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utente non trovato")
        
    if not bcrypt.checkpw(old_password.encode(), user[0].encode()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La password attuale è errata")
        
    new_hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    user_repository.update_user_password(user[2], new_hashed)
    return True

# ══════════════════════════════════════════════
# Recupero Password
# ══════════════════════════════════════════════

def request_password_reset(email: str):
    """Genera un codice OTP a 6 cifre, lo salva nel DB e invia l'email."""
    email_clean = email.strip().lower() if email else ""
    user = user_repository.get_user_by_email(email_clean)
    if not user:
        # Non rivelare se l'email esiste o meno per sicurezza
        return {"message": "Se l'email è registrata, riceverai un codice di recupero."}

    codice = str(random.randint(100000, 999999))
    scadenza = datetime.now() + timedelta(minutes=30)
    user_repository.set_reset_token(email_clean, codice, scadenza)
    invia_email_recupero_password(email_clean, codice)

    return {"message": "Se l'email è registrata, riceverai un codice di recupero."}

def reset_password(email: str, code: str, new_password: str):
    """Verifica il codice OTP e reimposta la password."""
    email_clean = email.strip().lower() if email else ""
    code_clean = code.strip() if code else ""
    user = user_repository.get_user_by_reset_token(email_clean, code_clean)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Codice non valido o email errata")

    # Indice 10 = reset_token_scadenza
    scadenza = user[10]
    if not scadenza:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Codice non valido")

    if isinstance(scadenza, str):
        scadenza = datetime.strptime(scadenza, "%Y-%m-%d %H:%M:%S")

    if scadenza < datetime.now():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Il codice è scaduto. Richiedine uno nuovo.")

    new_hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    user_repository.reset_password_with_token(user[2], new_hashed)

    return {"message": "Password reimpostata con successo. Puoi effettuare il login."}

# ══════════════════════════════════════════════
# Gestione Username
# ══════════════════════════════════════════════

def get_user_profile(id_utente: int):
    """Restituisce email, username e ruolo dell'utente."""
    user = user_repository.get_user_by_id(id_utente)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utente non trovato")
    return {
        "id_utente": user[2],
        "email": user[5],
        "username": user[6],
        "ruolo": user[1],
    }

def update_user_username(id_utente: int, username: str = None):
    """Valida e aggiorna l'username dell'utente."""
    if username is not None:
        username = username.strip()
    if not username:
        user_repository.update_username(id_utente, None)
        return {"message": "Nome utente rimosso con successo", "username": None}

    if len(username) < 3 or len(username) > 30:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Il nome utente deve essere tra 3 e 30 caratteri")
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Il nome utente può contenere solo lettere, numeri e underscore")

    # Controlla unicità
    existing = user_repository.get_user_by_username(username)
    if existing and existing[0] != id_utente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Questo nome utente è già utilizzato")

    try:
        user_repository.update_username(id_utente, username)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return {"message": "Nome utente aggiornato con successo", "username": username}
