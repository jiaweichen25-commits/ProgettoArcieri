import psycopg2
import os

DATABASE_URL = "postgresql://postgres:troia@db:5432/ProgettoArcieri"

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("✓ Connessione al database riuscita!")
    
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM "Tutenti"')
    count = cursor.fetchone()[0]
    print(f"✓ Numero di utenti nel database: {count}")
    
    cursor.execute('SELECT "IDutente", "E-mail", "Ruolo" FROM "Tutenti"')
    rows = cursor.fetchall()
    if rows:
        for row in rows:
            print(f"  - {row}")
    
    conn.close()
except Exception as e:
    print(f"✗ Errore di connessione: {e}")
