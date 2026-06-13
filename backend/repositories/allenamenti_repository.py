from config.database import get_db_conn

def get_allenamenti_by_atleta(id_atleta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDallenamento", "IDatleta", "DataInizio", "DataFine", "Obiettivi"
                   FROM "Tallenamenti"
                   WHERE "IDatleta" = %s
                   ORDER BY "DataInizio" DESC''',
                (id_atleta,)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_allenamento(id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "Tallenamenti" ("IDatleta", "DataInizio", "DataFine", "Obiettivi")
                   VALUES (%s, %s, %s, %s)
                   RETURNING "IDallenamento"''',
                (
                    id_atleta,
                    dati.get("data_inizio"),
                    dati.get("data_fine"),
                    dati.get("obiettivi"),
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_allenamento(id_allenamento: int, id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "Tallenamenti"
                   SET "DataInizio" = %s, "DataFine" = %s, "Obiettivi" = %s
                   WHERE "IDallenamento" = %s AND "IDatleta" = %s''',
                (
                    dati.get("data_inizio"),
                    dati.get("data_fine"),
                    dati.get("obiettivi"),
                    id_allenamento,
                    id_atleta,
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_allenamento(id_allenamento: int, id_atleta: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'DELETE FROM "Tallenamenti" WHERE "IDallenamento" = %s AND "IDatleta" = %s',
                (id_allenamento, id_atleta)
            )
            return cur.rowcount > 0
    finally:
        conn.close()