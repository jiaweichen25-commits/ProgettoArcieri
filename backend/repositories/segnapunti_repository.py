from config.database import get_db_conn


def _freccia_to_punti(v: str | None) -> int:
    if v is None or v == "" or v == "M":
        return 0
    if v == "X":
        return 10
    try:
        return int(v)
    except ValueError:
        return 0


def get_segnapunti(id_atleta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDsegnapunto", "IDatleta", "data", "distanza",
                          "frecce_per_volee", "note_istruttore", "note_atleta"
                   FROM "Tsegnapunti"
                   WHERE "IDatleta" = %s
                   ORDER BY "data" DESC''',
                (id_atleta,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_segnapunto(id_segnapunto: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDsegnapunto", "IDatleta", "data", "distanza",
                          "frecce_per_volee", "note_istruttore", "note_atleta"
                   FROM "Tsegnapunti"
                   WHERE "IDsegnapunto" = %s''',
                (id_segnapunto,)
            )
            return cur.fetchone()
    finally:
        conn.close()


def crea_segnapunto(id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "Tsegnapunti"
                   ("IDatleta", "data", "distanza", "frecce_per_volee",
                    "note_istruttore", "note_atleta")
                   VALUES (%s, %s, %s, %s, %s, %s)
                   RETURNING "IDsegnapunto"''',
                (
                    id_atleta,
                    dati["data"],
                    dati["distanza"],
                    dati.get("frecce_per_volee", 3),
                    dati.get("note_istruttore"),
                    dati.get("note_atleta"),
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()


def aggiorna_segnapunto(id_segnapunto: int, id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "Tsegnapunti"
                   SET "note_istruttore" = %s, "note_atleta" = %s
                   WHERE "IDsegnapunto" = %s AND "IDatleta" = %s''',
                (
                    dati.get("note_istruttore"),
                    dati.get("note_atleta"),
                    id_segnapunto,
                    id_atleta,
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()


def elimina_segnapunto(id_segnapunto: int, id_atleta: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'SELECT 1 FROM "Tsegnapunti" WHERE "IDsegnapunto" = %s AND "IDatleta" = %s',
                (id_segnapunto, id_atleta)
            )
            if cur.fetchone() is None:
                return False
            cur.execute(
                'DELETE FROM "TsegnapuntiVolee" WHERE "IDsegnapunto" = %s',
                (id_segnapunto,)
            )
            cur.execute(
                'DELETE FROM "Tsegnapunti" WHERE "IDsegnapunto" = %s AND "IDatleta" = %s',
                (id_segnapunto, id_atleta)
            )
            return cur.rowcount > 0
    finally:
        conn.close()


def get_volee(id_segnapunto: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDvolee", "IDsegnapunto", "mezza", "numero",
                          "f1", "f2", "f3", "f4", "f5", "f6", "somma", "totale"
                   FROM "TsegnapuntiVolee"
                   WHERE "IDsegnapunto" = %s
                   ORDER BY "mezza", "numero"''',
                (id_segnapunto,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def salva_volee(id_segnapunto: int, volee: list[dict]):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            ordinate = sorted(volee, key=lambda v: (v["mezza"], v["numero"]))
            totale_corrente = 0
            for v in ordinate:
                somma = sum(
                    _freccia_to_punti(v.get(f"f{i}")) for i in range(1, 7)
                )
                totale_corrente += somma
                cur.execute(
                    '''INSERT INTO "TsegnapuntiVolee"
                       ("IDsegnapunto", "mezza", "numero",
                        "f1", "f2", "f3", "f4", "f5", "f6", "somma", "totale")
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                       ON CONFLICT ("IDsegnapunto", "mezza", "numero") DO UPDATE SET
                           "f1" = EXCLUDED."f1", "f2" = EXCLUDED."f2",
                           "f3" = EXCLUDED."f3", "f4" = EXCLUDED."f4",
                           "f5" = EXCLUDED."f5", "f6" = EXCLUDED."f6",
                           "somma" = EXCLUDED."somma",
                           "totale" = EXCLUDED."totale"''',
                    (
                        id_segnapunto,
                        v["mezza"], v["numero"],
                        v.get("f1"), v.get("f2"), v.get("f3"),
                        v.get("f4"), v.get("f5"), v.get("f6"),
                        somma, totale_corrente,
                    )
                )
    finally:
        conn.close()