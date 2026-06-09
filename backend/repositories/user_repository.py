from config.database import get_db_conn

def get_user_by_email(email: str):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT "passwd_hash", "Ruolo", "IDutente" FROM "Tutenti" WHERE "E-mail" = %s', (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def create_user(email: str, hashed_password: str, ruolo: str) -> int:
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO "Tutenti" ("E-mail", "passwd_hash", "Ruolo") VALUES (%s, %s, %s) RETURNING "IDutente"',
        (email, hashed_password, ruolo)
    )
    id_utente = cur.fetchone()[0]
    # Collega automaticamente al profilo atleta se l'email coincide
    cur.execute(
        'UPDATE "Tatleti" SET "IDutente" = %s WHERE "E-mail" = %s AND "IDutente" IS NULL',
        (id_utente, email)
    )
    conn.commit()
    cur.close()
    conn.close()
    return id_utente
