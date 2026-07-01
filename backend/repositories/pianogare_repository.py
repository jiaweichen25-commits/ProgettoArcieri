from config.database import get_db_conn

def get_gare_by_allenamento(id_allenamento: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT p."IDpianogara", p."IDallenamento", p."IDtipogara",
                          t."Descrizione", p."Data", p."Luogo",
                          p."Distanza", p."Note", p."EscludiVisualizzazione"
                   FROM "Tpianogare" p
                   LEFT JOIN "TStipigare" t ON p."IDtipogara" = t."IDtipogara"
                   WHERE p."IDallenamento" = %s
                   ORDER BY p."Data" ASC NULLS LAST''',
                (id_allenamento,)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_gara(id_allenamento: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "Tpianogare"
                   ("IDallenamento", "IDtipogara", "Data", "Luogo",
                    "Distanza", "Note", "EscludiVisualizzazione")
                   VALUES (%s, %s, %s, %s, %s, %s, %s)
                   RETURNING "IDpianogara"''',
                (
                    id_allenamento,
                    dati.get("id_tipogara"),
                    dati.get("data"),
                    dati.get("luogo"),
                    dati.get("distanza"),
                    dati.get("note"),
                    dati.get("escludi_visualizzazione", False),
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_gara(id_pianogara: int, id_allenamento: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "Tpianogare"
                   SET "IDtipogara" = %s, "Data" = %s, "Luogo" = %s,
                       "Distanza" = %s, "Note" = %s, "EscludiVisualizzazione" = %s
                   WHERE "IDpianogara" = %s AND "IDallenamento" = %s''',
                (
                    dati.get("id_tipogara"),
                    dati.get("data"),
                    dati.get("luogo"),
                    dati.get("distanza"),
                    dati.get("note"),
                    dati.get("escludi_visualizzazione", False),
                    id_pianogara,
                    id_allenamento,
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_gara(id_pianogara: int, id_allenamento: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''DELETE FROM "Tpianogare"
                   WHERE "IDpianogara" = %s AND "IDallenamento" = %s''',
                (id_pianogara, id_allenamento)
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def get_tipi_gara():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "IDtipogara", "Descrizione", "Note" FROM "TStipigare" ORDER BY "Descrizione"'
            )
            return cur.fetchall()
    finally:
        conn.close()

def get_allenamenti_by_atleta_istruttore(id_istruttore: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT a."IDallenamento"
                   FROM "Tallenamenti" a
                   JOIN "Tatleti" at ON a."IDatleta" = at."IDatleta"
                   WHERE at."IDistruttore" = %s''',
                (id_istruttore,)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_tipo_gara(descrizione: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TStipigare" ("Descrizione")
                   VALUES (%s)
                   RETURNING "IDtipogara"''',
                (descrizione,)
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def elimina_tipo_gara(id_tipogara: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'DELETE FROM "TStipigare" WHERE "IDtipogara" = %s',
                (id_tipogara,)
            )
            return cur.rowcount > 0
    finally:
        conn.close()