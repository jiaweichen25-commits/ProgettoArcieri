from config.database import get_db_conn


# ─────────────────────────────────────────
# TdetAllenamenti  (la riga griglia)
# ─────────────────────────────────────────

def get_sedute(id_allenamento: int, id_settimana: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDallenamento", "IDsettimana", "IDseduta"
                   FROM "TdetAllenamenti"
                   WHERE "IDallenamento" = %s AND "IDsettimana" = %s
                   ORDER BY "IDseduta"''',
                (id_allenamento, id_settimana)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_seduta(id_allenamento: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TdetAllenamenti" ("IDallenamento", "IDsettimana", "IDseduta")
                   VALUES (%s, %s, %s)''',
                (
                    id_allenamento,
                    dati.get("id_settimana"),
                    dati.get("id_seduta"),
                )
            )
            return {
                "IDallenamento": id_allenamento,
                "IDsettimana": dati.get("id_settimana"),
                "IDseduta": dati.get("id_seduta"),
            }
    finally:
        conn.close()

def elimina_seduta(id_allenamento: int, id_settimana: int, id_seduta: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''DELETE FROM "TdetAllenamenti"
                   WHERE "IDallenamento" = %s AND "IDsettimana" = %s AND "IDseduta" = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.rowcount > 0
    finally:
        conn.close()


# ─────────────────────────────────────────
# TdetStretching
# ─────────────────────────────────────────

def get_stretching(id_allenamento: int, id_settimana: int, id_seduta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDdetStretching", "IDallenamento", "IDsettimana", "IDseduta",
                          "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                          "IDesercizioStretching"
                   FROM "TdetStretching"
                   WHERE "IDallenamento" = %s AND "IDsettimana" = %s AND "IDseduta" = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_stretching(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TdetStretching"
                   ("IDallenamento", "IDsettimana", "IDseduta",
                    "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                    "IDesercizioStretching")
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING "IDdetStretching"''',
                (
                    id_allenamento, id_settimana, id_seduta,
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"), dati.get("id_esercizio_stretching"),
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_stretching(id_det: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "TdetStretching"
                   SET "Lunedi" = %s, "Martedi" = %s, "Mercoledi" = %s, "Giovedi" = %s,
                       "Venerdi" = %s, "Sabato" = %s, "Domenica" = %s,
                       "IDesercizioStretching" = %s
                   WHERE "IDdetStretching" = %s''',
                (
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"), dati.get("id_esercizio_stretching"),
                    id_det,
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_stretching(id_det: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TdetStretching" WHERE "IDdetStretching" = %s', (id_det,))
            return cur.rowcount > 0
    finally:
        conn.close()


# ─────────────────────────────────────────
# TdetRiscaldamento
# ─────────────────────────────────────────

def get_riscaldamento(id_allenamento: int, id_settimana: int, id_seduta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDdetRiscaldamento", "IDallenamento", "IDsettimana", "IDseduta",
                          "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                          "IDesercizioRiscaldamento"
                   FROM "TdetRiscaldamento"
                   WHERE "IDallenamento" = %s AND "IDsettimana" = %s AND "IDseduta" = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_riscaldamento(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TdetRiscaldamento"
                   ("IDallenamento", "IDsettimana", "IDseduta",
                    "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                    "IDesercizioRiscaldamento")
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING "IDdetRiscaldamento"''',
                (
                    id_allenamento, id_settimana, id_seduta,
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"), dati.get("id_esercizio_riscaldamento"),
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_riscaldamento(id_det: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "TdetRiscaldamento"
                   SET "Lunedi" = %s, "Martedi" = %s, "Mercoledi" = %s, "Giovedi" = %s,
                       "Venerdi" = %s, "Sabato" = %s, "Domenica" = %s,
                       "IDesercizioRiscaldamento" = %s
                   WHERE "IDdetRiscaldamento" = %s''',
                (
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"), dati.get("id_esercizio_riscaldamento"),
                    id_det,
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_riscaldamento(id_det: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TdetRiscaldamento" WHERE "IDdetRiscaldamento" = %s', (id_det,))
            return cur.rowcount > 0
    finally:
        conn.close()


# ─────────────────────────────────────────
# TdetTecForCor
# ─────────────────────────────────────────

def get_tec_for_cor(id_allenamento: int, id_settimana: int, id_seduta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDdetTecForCor", "IDallenamento", "IDsettimana", "IDseduta",
                          "PosizionePiedi",
                          "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                          "IDdistanza", "IDtarga", "IDdescrizioneEsercizio"
                   FROM "TdetTecForCor"
                   WHERE "IDallenamento" = %s AND "IDsettimana" = %s AND "IDseduta" = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_tec_for_cor(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TdetTecForCor"
                   ("IDallenamento", "IDsettimana", "IDseduta",
                    "PosizionePiedi",
                    "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                    "IDdistanza", "IDtarga", "IDdescrizioneEsercizio")
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING "IDdetTecForCor"''',
                (
                    id_allenamento, id_settimana, id_seduta,
                    dati.get("posizione_piedi"),
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"),
                    dati.get("id_distanza"), dati.get("id_targa"),
                    dati.get("id_descrizione_esercizio"),
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_tec_for_cor(id_det: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "TdetTecForCor"
                   SET "PosizionePiedi" = %s,
                       "Lunedi" = %s, "Martedi" = %s, "Mercoledi" = %s, "Giovedi" = %s,
                       "Venerdi" = %s, "Sabato" = %s, "Domenica" = %s,
                       "IDdistanza" = %s, "IDtarga" = %s, "IDdescrizioneEsercizio" = %s
                   WHERE "IDdetTecForCor" = %s''',
                (
                    dati.get("posizione_piedi"),
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"),
                    dati.get("id_distanza"), dati.get("id_targa"),
                    dati.get("id_descrizione_esercizio"),
                    id_det,
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_tec_for_cor(id_det: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TdetTecForCor" WHERE "IDdetTecForCor" = %s', (id_det,))
            return cur.rowcount > 0
    finally:
        conn.close()


# ─────────────────────────────────────────
# TdetAllFisForRes
# ─────────────────────────────────────────

def get_all_fis_for_res(id_allenamento: int, id_settimana: int, id_seduta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDdetAllFisForRes", "IDallenamento", "IDsettimana", "IDseduta",
                          "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                          "IDtabella_n", "IDdescrizioneEsercizioAllFisForRes"
                   FROM "TdetAllFisForRes"
                   WHERE "IDallenamento" = %s AND "IDsettimana" = %s AND "IDseduta" = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_all_fis_for_res(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TdetAllFisForRes"
                   ("IDallenamento", "IDsettimana", "IDseduta",
                    "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                    "IDtabella_n", "IDdescrizioneEsercizioAllFisForRes")
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING "IDdetAllFisForRes"''',
                (
                    id_allenamento, id_settimana, id_seduta,
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"),
                    dati.get("id_tabella_n"),
                    dati.get("id_descrizione_esercizio_all_fis_for_res"),
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_all_fis_for_res(id_det: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "TdetAllFisForRes"
                   SET "Lunedi" = %s, "Martedi" = %s, "Mercoledi" = %s, "Giovedi" = %s,
                       "Venerdi" = %s, "Sabato" = %s, "Domenica" = %s,
                       "IDtabella_n" = %s, "IDdescrizioneEsercizioAllFisForRes" = %s
                   WHERE "IDdetAllFisForRes" = %s''',
                (
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"),
                    dati.get("id_tabella_n"),
                    dati.get("id_descrizione_esercizio_all_fis_for_res"),
                    id_det,
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_all_fis_for_res(id_det: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TdetAllFisForRes" WHERE "IDdetAllFisForRes" = %s', (id_det,))
            return cur.rowcount > 0
    finally:
        conn.close()


# ─────────────────────────────────────────
# TdetAllFisCor
# ─────────────────────────────────────────

def get_all_fis_cor(id_allenamento: int, id_settimana: int, id_seduta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDdetAllFisCor", "IDallenamento", "IDsettimana", "IDseduta",
                          "IDattrezzo",
                          "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                          "IDdescrizioneEsercizioAllFisCor"
                   FROM "TdetAllFisCor"
                   WHERE "IDallenamento" = %s AND "IDsettimana" = %s AND "IDseduta" = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()

def crea_all_fis_cor(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TdetAllFisCor"
                   ("IDallenamento", "IDsettimana", "IDseduta",
                    "IDattrezzo",
                    "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica",
                    "IDdescrizioneEsercizioAllFisCor")
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING "IDdetAllFisCor"''',
                (
                    id_allenamento, id_settimana, id_seduta,
                    dati.get("id_attrezzo"),
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"),
                    dati.get("id_descrizione_esercizio_all_fis_cor"),
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_all_fis_cor(id_det: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "TdetAllFisCor"
                   SET "IDattrezzo" = %s,
                       "Lunedi" = %s, "Martedi" = %s, "Mercoledi" = %s, "Giovedi" = %s,
                       "Venerdi" = %s, "Sabato" = %s, "Domenica" = %s,
                       "IDdescrizioneEsercizioAllFisCor" = %s
                   WHERE "IDdetAllFisCor" = %s''',
                (
                    dati.get("id_attrezzo"),
                    dati.get("lunedi"), dati.get("martedi"), dati.get("mercoledi"),
                    dati.get("giovedi"), dati.get("venerdi"), dati.get("sabato"),
                    dati.get("domenica"),
                    dati.get("id_descrizione_esercizio_all_fis_cor"),
                    id_det,
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_all_fis_cor(id_det: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TdetAllFisCor" WHERE "IDdetAllFisCor" = %s', (id_det,))
            return cur.rowcount > 0
    finally:
        conn.close()


# ─────────────────────────────────────────
# TdetNoteAtleta
# ─────────────────────────────────────────

def get_nota(id_allenamento: int, id_settimana: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDnota", "IDallenamento", "IDsettimana", "Nota"
                   FROM "TdetNoteAtleta"
                   WHERE "IDallenamento" = %s AND "IDsettimana" = %s''',
                (id_allenamento, id_settimana)
            )
            return cur.fetchone()
    finally:
        conn.close()

def crea_nota(id_allenamento: int, id_settimana: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TdetNoteAtleta" ("IDallenamento", "IDsettimana", "Nota")
                   VALUES (%s, %s, %s)
                   RETURNING "IDnota"''',
                (id_allenamento, id_settimana, dati.get("nota"))
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_nota(id_nota: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "TdetNoteAtleta" SET "Nota" = %s WHERE "IDnota" = %s''',
                (dati.get("nota"), id_nota)
            )
            return cur.rowcount > 0
    finally:
        conn.close()


# ─────────────────────────────────────────
# LOOKUP TABLES
# ─────────────────────────────────────────

def get_lookup_stretching():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDesercizioStretching", "NomeEsercizio" FROM "TSstretching" ORDER BY "NomeEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_riscaldamento():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDesercizioRiscaldamento", "NomeEsercizio" FROM "TSriscaldamento" ORDER BY "NomeEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_distanza():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDdistanza", "NomeEsercizio" FROM "TSdistanza" ORDER BY "NomeEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_targa():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDtarga", "NomeTarga" FROM "TStarga" ORDER BY "NomeTarga"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_descrizione_esercizio():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDdescrizioneEsercizio", "NomeEsercizio" FROM "TSDescrizioneEsercizio" ORDER BY "NomeEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_tabella_numero():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDtabella_n", "NumeroTabella" FROM "TStabellaNumero" ORDER BY "NumeroTabella"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_desc_esercizio_all_fis_for_res():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDdescrizioneEsercizioAllFisForRes", "DescrizioneEsercizio" FROM "TSdescrizioneEsercizioAllFisForRes" ORDER BY "DescrizioneEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_attrezzi():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDattrezzo", "AttrezzoDes" FROM "TSattrezzi" ORDER BY "AttrezzoDes"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_desc_esercizio_all_fis_cor():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDdescrizioneEsercizioAllFisCor", "DescrizioneEsercizio" FROM "TSdesEsercizioAllFisCor" ORDER BY "DescrizioneEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def crea_seduta_se_non_esiste(id_allenamento: int, id_settimana: int, id_seduta: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TdetAllenamenti" ("IDallenamento", "IDsettimana", "IDseduta")
                   VALUES (%s, %s, %s)
                   ON CONFLICT DO NOTHING''',
                (id_allenamento, id_settimana, id_seduta)
            )
    finally:
        conn.close()