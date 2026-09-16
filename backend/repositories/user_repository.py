from config.database import get_db_conn
from psycopg2.errors import UniqueViolation

def ensure_security_columns():
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('''
                ALTER TABLE "Tutenti" ADD COLUMN IF NOT EXISTS tentativi_falliti integer DEFAULT 0 NOT NULL;
                ALTER TABLE "Tutenti" ADD COLUMN IF NOT EXISTS bloccato_fino_al timestamp without time zone;
                ALTER TABLE "Tutenti" ADD COLUMN IF NOT EXISTS reset_token character varying;
                ALTER TABLE "Tutenti" ADD COLUMN IF NOT EXISTS reset_token_scadenza timestamp without time zone;
            ''')
    except Exception as e:
        print(f"Warning: could not ensure security columns: {e}")
    finally:
        conn.close()

# Esegui migrazione automatica all'import
ensure_security_columns()

def get_user_by_email_or_username(identifier: str):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "passwd_hash", "Ruolo", "IDutente", must_change_password, sospeso_fino_al, '
                '"E-mail", "Username", tentativi_falliti, bloccato_fino_al, reset_token, reset_token_scadenza '
                'FROM "Tutenti" WHERE LOWER("E-mail") = LOWER(%s) OR LOWER("Username") = LOWER(%s)',
                (identifier, identifier)
            )
            return cur.fetchone()
    finally:
        conn.close()

def get_user_by_email(email: str):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "passwd_hash", "Ruolo", "IDutente", must_change_password, sospeso_fino_al, '
                '"E-mail", "Username", tentativi_falliti, bloccato_fino_al, reset_token, reset_token_scadenza '
                'FROM "Tutenti" WHERE LOWER("E-mail") = LOWER(%s)',
                (email,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def get_user_by_id(id_utente: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "passwd_hash", "Ruolo", "IDutente", must_change_password, sospeso_fino_al, '
                '"E-mail", "Username", tentativi_falliti, bloccato_fino_al '
                'FROM "Tutenti" WHERE "IDutente" = %s',
                (id_utente,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def get_user_by_username(username: str):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "IDutente", "E-mail", "Username" FROM "Tutenti" WHERE LOWER("Username") = LOWER(%s)',
                (username,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def increment_failed_attempts(id_utente: int, lock_until=None):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            if lock_until:
                cur.execute(
                    'UPDATE "Tutenti" SET tentativi_falliti = 5, bloccato_fino_al = %s WHERE "IDutente" = %s',
                    (lock_until, id_utente)
                )
            else:
                cur.execute(
                    'UPDATE "Tutenti" SET tentativi_falliti = tentativi_falliti + 1 WHERE "IDutente" = %s',
                    (id_utente,)
                )
    finally:
        conn.close()

def reset_failed_attempts(id_utente: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'UPDATE "Tutenti" SET tentativi_falliti = 0, bloccato_fino_al = NULL WHERE "IDutente" = %s',
                (id_utente,)
            )
    finally:
        conn.close()

def set_reset_token(email: str, token: str, expiry):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'UPDATE "Tutenti" SET reset_token = %s, reset_token_scadenza = %s WHERE LOWER("E-mail") = LOWER(%s)',
                (token, expiry, email)
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def get_user_by_reset_token(email: str, token: str):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "passwd_hash", "Ruolo", "IDutente", must_change_password, sospeso_fino_al, '
                '"E-mail", "Username", tentativi_falliti, bloccato_fino_al, reset_token, reset_token_scadenza '
                'FROM "Tutenti" WHERE LOWER("E-mail") = LOWER(%s) AND reset_token = %s',
                (email, token)
            )
            return cur.fetchone()
    finally:
        conn.close()

def reset_password_with_token(id_utente: int, new_hashed_password: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'UPDATE "Tutenti" '
                'SET passwd_hash = %s, reset_token = NULL, reset_token_scadenza = NULL, '
                'tentativi_falliti = 0, bloccato_fino_al = NULL, must_change_password = false '
                'WHERE "IDutente" = %s',
                (new_hashed_password, id_utente)
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def update_username(id_utente: int, username: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'UPDATE "Tutenti" SET "Username" = %s WHERE "IDutente" = %s',
                (username if username else None, id_utente)
            )
            return cur.rowcount > 0
    except UniqueViolation:
        raise ValueError("Questo nome utente è già utilizzato da un altro account")
    finally:
        conn.close()

def create_user(email: str, hashed_password: str, ruolo: str, must_change_password: bool = False, username: str = None):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "Tutenti" ("E-mail", "Username", "passwd_hash", "Ruolo", must_change_password) VALUES (LOWER(%s), %s, %s, %s, %s)',
                (email, username, hashed_password, ruolo, must_change_password)
            )
    except UniqueViolation:
        raise ValueError("Email o Username già registrati")
    finally:
        conn.close()

def create_istruttore(id_utente: int, nome: str, cognome: str, email: str, qualifica: str = None):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "Tistruttori" ("IDutente", "Nome", "Cognome", "Qualifica", "E-mail")
                   VALUES (%s, %s, %s, %s, %s)''',
                (id_utente, nome, cognome, qualifica, email)
            )
    finally:
        conn.close()

def delete_user(id_utente: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'DELETE FROM "Tutenti" WHERE "IDutente" = %s',
                (id_utente,)
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def update_user_password(id_utente: int, new_hashed_password: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'UPDATE "Tutenti" SET passwd_hash = %s, must_change_password = false WHERE "IDutente" = %s',
                (new_hashed_password, id_utente)
            )
    finally:
        conn.close()

def update_user_credentials(id_utente: int, email: str, username: str = None):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'UPDATE "Tutenti" SET "E-mail" = LOWER(%s), "Username" = %s WHERE "IDutente" = %s',
                (email, username, id_utente)
            )
    except UniqueViolation:
        raise ValueError("Email o Username già in uso")
    finally:
        conn.close()

def update_istruttore_details(id_istruttore: int, nome: str, cognome: str, email: str, qualifica: str, username: str = None):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            # Get IDutente
            cur.execute('SELECT "IDutente" FROM "Tistruttori" WHERE "IDistruttore" = %s', (id_istruttore,))
            row = cur.fetchone()
            if not row:
                raise ValueError("Istruttore non trovato")
            id_utente = row[0]
            
            # Update Tistruttori
            cur.execute(
                'UPDATE "Tistruttori" SET "Nome" = %s, "Cognome" = %s, "E-mail" = LOWER(%s), "Qualifica" = %s WHERE "IDistruttore" = %s',
                (nome, cognome, email, qualifica, id_istruttore)
            )
            
            # Update Tutenti
            cur.execute(
                'UPDATE "Tutenti" SET "E-mail" = LOWER(%s), "Username" = %s WHERE "IDutente" = %s',
                (email, username, id_utente)
            )
    except UniqueViolation:
        raise ValueError("Email o Username già in uso")
    finally:
        conn.close()

def delete_istruttore(id_istruttore: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('SELECT "IDutente" FROM "Tistruttori" WHERE "IDistruttore" = %s', (id_istruttore,))
            row = cur.fetchone()
            if row:
                id_utente = row[0]
                cur.execute('DELETE FROM "Tistruttori" WHERE "IDistruttore" = %s', (id_istruttore,))
                cur.execute('DELETE FROM "Tutenti" WHERE "IDutente" = %s', (id_utente,))
    finally:
        conn.close()

def suspend_user(id_utente: int, data_fine_sospensione: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'UPDATE "Tutenti" SET sospeso_fino_al = %s WHERE "IDutente" = %s',
                (data_fine_sospensione, id_utente)
            )
    finally:
        conn.close()