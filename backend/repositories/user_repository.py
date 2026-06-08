from config.database import get_db_conn

def get_user_by_email(email: str):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT "passwd_hash", "Ruolo", "IDutente" FROM "Tutenti" WHERE "E-mail" = %s', (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def create_user(email: str, hashed_password: str, ruolo: str):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO "Tutenti" ("E-mail", "passwd_hash", "Ruolo") VALUES (%s, %s, %s)',
        (email, hashed_password, ruolo)
    )
    conn.commit()
    cur.close()
    conn.close()
