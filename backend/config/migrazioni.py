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

# Indici sulle colonne usate nei WHERE (PostgreSQL non li crea da solo per le chiavi esterne):
# senza, ogni ricerca legge tutta la tabella. Stessi nomi di quelli sotto le CREATE TABLE di ProgettoArcieri.sql.
INDICI = [
    # login e recupero password cercano con LOWER(...): l'indice deve essere su LOWER(...)
    'CREATE INDEX IF NOT EXISTS index_tutenti_email ON "Tutenti" (LOWER("E-mail"))',
    'CREATE INDEX IF NOT EXISTS index_tutenti_username ON "Tutenti" (LOWER("Username"))',
    'CREATE INDEX IF NOT EXISTS index_tistruttori_idutente ON "Tistruttori" ("IDutente")',
    'CREATE INDEX IF NOT EXISTS index_tatleti_idistruttore ON "Tatleti" ("IDistruttore")',
    'CREATE INDEX IF NOT EXISTS index_tatleti_idutente ON "Tatleti" ("IDutente")',
    'CREATE INDEX IF NOT EXISTS index_tmateriali_idatleta ON "Tmateriali" ("IDatleta")',
    'CREATE INDEX IF NOT EXISTS index_tallenamenti_idatleta ON "Tallenamenti" ("IDatleta")',
    'CREATE INDEX IF NOT EXISTS index_tdetstretching_seduta ON "TdetStretching" ("IDallenamento", "IDsettimana", "IDseduta")',
    'CREATE INDEX IF NOT EXISTS index_tdetriscaldamento_seduta ON "TdetRiscaldamento" ("IDallenamento", "IDsettimana", "IDseduta")',
    'CREATE INDEX IF NOT EXISTS index_tdettecforcor_seduta ON "TdetTecForCor" ("IDallenamento", "IDsettimana", "IDseduta")',
    'CREATE INDEX IF NOT EXISTS index_tdetallfisforres_seduta ON "TdetAllFisForRes" ("IDallenamento", "IDsettimana", "IDseduta")',
    'CREATE INDEX IF NOT EXISTS index_tdetallfiscor_seduta ON "TdetAllFisCor" ("IDallenamento", "IDsettimana", "IDseduta")',
    'CREATE INDEX IF NOT EXISTS index_tvisitemediche_idatleta ON "Tvisitemediche" ("IDatleta")',
    'CREATE INDEX IF NOT EXISTS index_tantidoping_idatleta ON "Tantidoping" ("IDatleta")',
    'CREATE INDEX IF NOT EXISTS index_tpianogare_idallenamento ON "Tpianogare" ("IDallenamento")',
    'CREATE INDEX IF NOT EXISTS index_tsegnapunti_idatleta ON "Tsegnapunti" ("IDatleta")',
]


def _esegui(comandi):
    # IF NOT EXISTS: dal secondo avvio in poi i comandi non fanno niente
    for comando in comandi:
        conn = get_db_conn()
        try:
            with conn, conn.cursor() as cur:
                cur.execute(comando)
        except psycopg2.Error as e:
            # Per i vincoli, di solito: righe doppie gia' presenti. Il messaggio dice quali, vanno sistemate a mano.
            print(f"[MIGRAZIONE] non riuscita, {comando}: {e}", flush=True)
        finally:
            conn.close()


def ensure_vincoli_unici():
    _esegui(VINCOLI_UNICI)


def ensure_indici():
    _esegui(INDICI)
