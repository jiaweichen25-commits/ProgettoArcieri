from config.database import get_db_conn


# ─────────────────────────────────────────
# Lookup tables — letture (usate per popolare i dropdown)
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

def get_lookup_posizione_piedi():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDposizionePiedi", "NomePosizione" FROM "TSposizionePiedi" ORDER BY "NomePosizione"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_serie():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDserie", "Serie", "NumeroFrecce" FROM "TSserie" ORDER BY "NumeroFrecce"')
            return cur.fetchall()
    finally:
        conn.close()

# ─────────────────────────────────────────
# Lookup tables — create / delete (gestite dall'istruttore in UI)
# ─────────────────────────────────────────

def crea_lookup_stretching(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSstretching" ("NomeEsercizio") VALUES (%s) RETURNING "IDesercizioStretching", "NomeEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_stretching(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSstretching" WHERE "IDesercizioStretching" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_riscaldamento(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSriscaldamento" ("NomeEsercizio") VALUES (%s) RETURNING "IDesercizioRiscaldamento", "NomeEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_riscaldamento(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSriscaldamento" WHERE "IDesercizioRiscaldamento" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_distanza(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSdistanza" ("NomeEsercizio") VALUES (%s) RETURNING "IDdistanza", "NomeEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_distanza(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSdistanza" WHERE "IDdistanza" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_targa(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TStarga" ("NomeTarga") VALUES (%s) RETURNING "IDtarga", "NomeTarga"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_targa(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TStarga" WHERE "IDtarga" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_descrizione_esercizio(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSDescrizioneEsercizio" ("NomeEsercizio") VALUES (%s) RETURNING "IDdescrizioneEsercizio", "NomeEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_descrizione_esercizio(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSDescrizioneEsercizio" WHERE "IDdescrizioneEsercizio" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_tabella_numero(numero: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TStabellaNumero" ("NumeroTabella") VALUES (%s) RETURNING "IDtabella_n", "NumeroTabella"',
                (numero,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_tabella_numero(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TStabellaNumero" WHERE "IDtabella_n" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_desc_esercizio_all_fis_for_res(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSdescrizioneEsercizioAllFisForRes" ("DescrizioneEsercizio") VALUES (%s) RETURNING "IDdescrizioneEsercizioAllFisForRes", "DescrizioneEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_desc_esercizio_all_fis_for_res(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSdescrizioneEsercizioAllFisForRes" WHERE "IDdescrizioneEsercizioAllFisForRes" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_attrezzi(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSattrezzi" ("AttrezzoDes") VALUES (%s) RETURNING "IDattrezzo", "AttrezzoDes"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_attrezzi(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSattrezzi" WHERE "IDattrezzo" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_desc_esercizio_all_fis_cor(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSdesEsercizioAllFisCor" ("DescrizioneEsercizio") VALUES (%s) RETURNING "IDdescrizioneEsercizioAllFisCor", "DescrizioneEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_desc_esercizio_all_fis_cor(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSdesEsercizioAllFisCor" WHERE "IDdescrizioneEsercizioAllFisCor" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_posizione_piedi(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSposizionePiedi" ("NomePosizione") VALUES (%s) RETURNING "IDposizionePiedi", "NomePosizione"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_posizione_piedi(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSposizionePiedi" WHERE "IDposizionePiedi" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_serie(serie: str, numero_frecce: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSserie" ("Serie", "NumeroFrecce") VALUES (%s, %s) RETURNING "IDserie", "Serie", "NumeroFrecce"',
                (serie, numero_frecce)
                )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_serie(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'DELETE FROM "TSserie" WHERE "IDserie" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()
            
