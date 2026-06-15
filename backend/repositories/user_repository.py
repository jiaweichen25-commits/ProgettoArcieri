from config.database import get_db_conn
from psycopg2.errors import UniqueViolation

def get_user_by_email(email: str):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "passwd_hash", "Ruolo", "IDutente" FROM "Tutenti" WHERE LOWER("E-mail") = LOWER(%s)',
                (email,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def create_user(email: str, hashed_password: str, ruolo: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "Tutenti" ("E-mail", "passwd_hash", "Ruolo") VALUES (LOWER(%s), %s, %s)',
                (email, hashed_password, ruolo)
            )
    except UniqueViolation:
        raise ValueError("Email già registrata")
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