from config.database import get_db_conn

def get_antidoping_by_atleta(id_atleta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDantidoping", "IDatleta", "Anno",
                          "AutorizzazioneFitarco", "ScadenzaAutorizzazione"
                   FROM "Tantidoping"
                   WHERE "IDatleta" = %s
                   ORDER BY "Anno" DESC''',
                (id_atleta,)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_antidoping(id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "Tantidoping"
                   ("IDatleta", "Anno", "AutorizzazioneFitarco", "ScadenzaAutorizzazione")
                   VALUES (%s, %s, %s, %s)
                   RETURNING "IDantidoping"''',
                (
                    id_atleta,
                    dati.get("anno"),
                    dati.get("autorizzazione_fitarco", False),
                    dati.get("scadenza_autorizzazione"),
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_antidoping(id_antidoping: int, id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "Tantidoping"
                   SET "Anno" = %s, "AutorizzazioneFitarco" = %s, "ScadenzaAutorizzazione" = %s
                   WHERE "IDantidoping" = %s AND "IDatleta" = %s''',
                (
                    dati.get("anno"),
                    dati.get("autorizzazione_fitarco", False),
                    dati.get("scadenza_autorizzazione"),
                    id_antidoping,
                    id_atleta,
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_antidoping(id_antidoping: int, id_atleta: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'DELETE FROM "Tantidoping" WHERE "IDantidoping" = %s AND "IDatleta" = %s',
                (id_antidoping, id_atleta)
            )
            return cur.rowcount > 0
    finally:
        conn.close()