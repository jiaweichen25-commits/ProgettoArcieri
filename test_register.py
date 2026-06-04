import psycopg2
import bcrypt

DATABASE_URL = "postgresql://postgres:troia@db:5432/ProgettoArcieri"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Registra un utente di test
email = "test@example.com"
password = "password123"
ruolo = "atleta"

# Hash password
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

try:
    cur.execute(
        'INSERT INTO "Tutenti" ("E-mail", "passwd_hash", "Ruolo") VALUES (%s, %s, %s)',
        (email, hashed, ruolo)
    )
    conn.commit()
    print("✓ Utente registrato con successo!")
    
    # Verifica
    cur.execute('SELECT COUNT(*) FROM "Tutenti"')
    print(f"✓ Utenti nel database: {cur.fetchone()[0]}")
    
except Exception as e:
    print(f"✗ Errore: {e}")
    conn.rollback()

cur.close()
conn.close()
