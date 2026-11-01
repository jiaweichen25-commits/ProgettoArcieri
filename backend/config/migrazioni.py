import psycopg2
from config.database import get_db_conn

# Vincoli UNIQUE aggiunti dopo la creazione del database: sono gia' nelle CREATE TABLE di ProgettoArcieri.sql,
# che pero' gira solo su un database nuovo. I nomi sono quelli che Postgres da' da solo a quei UNIQUE
# (tabella_colonne_key), cosi' su un database nuovo IF NOT EXISTS li trova e non crea un doppione.
VINCOLI_UNICI = [
    # una serie compare una volta sola, altrimenti il totale frecce si moltiplica
    'CREATE UNIQUE INDEX IF NOT EXISTS "TSserie_Serie_key" ON "TSserie" ("Serie")',
    # una sola riga di note per settimana: salva_nota usa ON CONFLICT su queste due colonne
    'CREATE UNIQUE INDEX IF NOT EXISTS "TdetNoteAtleta_IDallenamento_IDsettimana_key" ON "TdetNoteAtleta" ("IDallenamento", "IDsettimana")',
]


def ensure_vincoli_unici():
    for comando in VINCOLI_UNICI:
        conn = get_db_conn()
        try:
            with conn, conn.cursor() as cur:
                cur.execute(comando)
        except psycopg2.Error as e:
            # Di solito: righe doppie gia' presenti. Il messaggio dice quali, vanno sistemate a mano.
            print(f"[MIGRAZIONE] vincolo non creato, {comando}: {e}", flush=True)
        finally:
            conn.close()
