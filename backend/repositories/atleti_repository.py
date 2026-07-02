from config.database import get_db_conn
from psycopg2.errors import UniqueViolation

def get_atleti_by_istruttore(id_istruttore: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDatleta", "Nome", "Cognome", "Codice_Fiscale",
                          "DataNascita", "Telefono", "Cellulare", "E-mail",
                          "Indirizzo", "CAP", "CITTA"
                   FROM "Tatleti"
                   WHERE "IDistruttore" = %s
                   ORDER BY "Cognome", "Nome"''',
                (id_istruttore,)
            )
            return cur.fetchall()
    finally:
        conn.close()

def get_atleta_by_id_utente(id_utente: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDatleta", "Nome", "Cognome", "Codice_Fiscale",
                          "DataNascita", "Telefono", "Cellulare", "E-mail",
                          "Indirizzo", "CAP", "CITTA"
                   FROM "Tatleti"
                   WHERE "IDutente" = %s''',
                (id_utente,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def get_id_istruttore_by_utente(id_utente: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "IDistruttore" FROM "Tistruttori" WHERE "IDutente" = %s',
                (id_utente,)
            )
            row = cur.fetchone()
            return row[0] if row else None
    finally:
        conn.close()

def crea_atleta(id_istruttore: int, id_utente_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        # 'with conn' gestisce AUTOMATICAMENTE commit e rollback
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "Tatleti"
                   ("IDistruttore", "IDutente", "Nome", "Cognome", "Codice_Fiscale",
                    "DataNascita", "Telefono", "Cellulare", "E-mail",
                    "Indirizzo", "CAP", "CITTA")
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING "IDatleta"''',
                (
                    id_istruttore,
                    id_utente_atleta,
                    dati.get("nome"), dati.get("cognome"), dati.get("codice_fiscale"),
                    dati.get("data_nascita"), dati.get("telefono"),
                    dati.get("cellulare"), dati.get("email"),
                    dati.get("indirizzo"), dati.get("cap"), dati.get("citta")
                )
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_atleta(id_atleta: int, id_istruttore: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "Tatleti"
                   SET "Nome" = %s, "Cognome" = %s, "Codice_Fiscale" = %s,
                       "DataNascita" = %s, "Telefono" = %s, "Cellulare" = %s,
                       "E-mail" = %s, "Indirizzo" = %s, "CAP" = %s, "CITTA" = %s
                   WHERE "IDatleta" = %s AND "IDistruttore" = %s''',
                (
                    dati.get("nome"), dati.get("cognome"), dati.get("codice_fiscale"),
                    dati.get("data_nascita"), dati.get("telefono"),
                    dati.get("cellulare"), dati.get("email"),
                    dati.get("indirizzo"), dati.get("cap"), dati.get("citta"),
                    id_atleta, id_istruttore
                )
            )
            return cur.rowcount > 0
    except UniqueViolation:
        raise ValueError("Email o Codice Fiscale già in uso da un altro atleta")
    finally:
        conn.close()

def elimina_atleta(id_atleta: int, id_istruttore: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'SELECT "IDutente" FROM "Tatleti" WHERE "IDatleta" = %s AND "IDistruttore" = %s',
                (id_atleta, id_istruttore)
            )
            row = cur.fetchone()
            if row is None:
                return None
            id_utente_atleta = row[0]

            # elimina in cascata i dettagli di ogni piano di allenamento dell'atleta
            # (nessuna FK ha ON DELETE CASCADE)
            sotto_query_allenamenti = '(SELECT "IDallenamento" FROM "Tallenamenti" WHERE "IDatleta" = %s)'
            for tabella in (
                "TdetStretching", "TdetRiscaldamento", "TdetTecForCor",
                "TdetAllFisForRes", "TdetAllFisCor", "TdetNoteAtleta",
                "TdetAllenamenti", "Tpianogare",
            ):
                cur.execute(
                    f'DELETE FROM "{tabella}" WHERE "IDallenamento" IN {sotto_query_allenamenti}',
                    (id_atleta,)
                )
            cur.execute('DELETE FROM "Tallenamenti" WHERE "IDatleta" = %s', (id_atleta,))

            # elimina il resto dei dati anagrafici collegati all'atleta
            cur.execute('DELETE FROM "Tmateriali" WHERE "IDatleta" = %s', (id_atleta,))
            cur.execute('DELETE FROM "Tvisitemediche" WHERE "IDatleta" = %s', (id_atleta,))
            cur.execute('DELETE FROM "Tantidoping" WHERE "IDatleta" = %s', (id_atleta,))

            cur.execute(
                'DELETE FROM "Tatleti" WHERE "IDatleta" = %s AND "IDistruttore" = %s',
                (id_atleta, id_istruttore)
            )
            return id_utente_atleta
    finally:
        conn.close()