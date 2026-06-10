from config.database import get_db_conn
from psycopg2.errors import UniqueViolation

def get_user_by_email(email: str):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT "passwd_hash", "Ruolo", "IDutente" FROM "Tutenti" WHERE LOWER("E-mail") = LOWER(%s)', (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def create_user(email: str, hashed_password: str, ruolo: str):
    conn = get_db_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO "Tutenti" ("E-mail", "passwd_hash", "Ruolo") VALUES (LOWER(%s), %s, %s)',
            (email, hashed_password, ruolo)
        )
        conn.commit()
    except UniqueViolation:
        conn.rollback()
        raise ValueError("Email già registrata")
    finally:
        cur.close()
        conn.close()

def create_istruttore(id_utente: int, nome: str, cognome: str, email: str, qualifica: str = None):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute(
        '''INSERT INTO "Tistruttori" ("IDutente", "Nome", "Cognome", "Qualifica", "E-mail")
           VALUES (%s, %s, %s, %s, %s)''',
        (id_utente, nome, cognome, qualifica, email)
    )
    conn.commit()
    cur.close()
    conn.close()
