from config.database import get_db_conn

def get_visite_by_atleta(id_atleta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDvisita", "IDatleta", "DataVisita", "DataScadenza"
                   FROM "Tvisitemediche"
                   WHERE "IDatleta" = %s
                   ORDER BY "DataVisita" DESC''',
                (id_atleta,)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_visita(id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "Tvisitemediche" ("IDatleta", "DataVisita", "DataScadenza")
                   VALUES (%s, %s, %s)
                   RETURNING "IDvisita"''',
                (id_atleta, dati.get("data_visita"), dati.get("data_scadenza"))
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_visita(id_visita: int, id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "Tvisitemediche"
                   SET "DataVisita" = %s, "DataScadenza" = %s
                   WHERE "IDvisita" = %s AND "IDatleta" = %s''',
                (dati.get("data_visita"), dati.get("data_scadenza"), id_visita, id_atleta)
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_visita(id_visita: int, id_atleta: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'DELETE FROM "Tvisitemediche" WHERE "IDvisita" = %s AND "IDatleta" = %s',
                (id_visita, id_atleta)
            )
            return cur.rowcount > 0
    finally:
        conn.close()