from config.database import get_db_conn

# Le funzioni "_con_nomi" leggono le righe di TUTTO l'allenamento con una query sola
# (prima: una query per ogni seduta). Le ultime due colonne sono "IDsettimana" e "IDseduta":
# me_service.get_dettaglio_allenamento le usa per dividere le righe per seduta.


def get_sedute_by_allenamento(id_allenamento: int):
    """Restituisce tutte le settimane/sedute di un allenamento."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDallenamento", "IDsettimana", "IDseduta"
                   FROM "TdetAllenamenti"
                   WHERE "IDallenamento" = %s
                   ORDER BY "IDsettimana", "IDseduta"''',
                (id_allenamento,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_stretching_con_nomi(id_allenamento: int):
    """Stretching con nome esercizio risolto via LEFT JOIN."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d."IDdetStretching",
                          lk."NomeEsercizio",
                          d."Lunedi", d."Martedi", d."Mercoledi",
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica",
                          d."IDsettimana", d."IDseduta"
                   FROM "TdetStretching" d
                   LEFT JOIN "TSstretching" lk
                          ON d."IDesercizioStretching" = lk."IDesercizioStretching"
                   WHERE d."IDallenamento" = %s
                   ORDER BY d."IDdetStretching"''',
                (id_allenamento,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_riscaldamento_con_nomi(id_allenamento: int):
    """Riscaldamento con nome esercizio risolto via LEFT JOIN."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d."IDdetRiscaldamento",
                          lk."NomeEsercizio",
                          d."Lunedi", d."Martedi", d."Mercoledi",
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica",
                          d."IDsettimana", d."IDseduta"
                   FROM "TdetRiscaldamento" d
                   LEFT JOIN "TSriscaldamento" lk
                          ON d."IDesercizioRiscaldamento" = lk."IDesercizioRiscaldamento"
                   WHERE d."IDallenamento" = %s
                   ORDER BY d."IDdetRiscaldamento"''',
                (id_allenamento,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_tec_for_cor_con_nomi(id_allenamento: int):
    """TecForCor con nomi risolti: posizione piedi, distanza, targa, descrizione esercizio."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d."IDdetTecForCor",
                          pp."NomePosizione",
                          dist."NomeEsercizio"   AS distanza_nome,
                          tg."NomeTarga",
                          de."NomeEsercizio"      AS esercizio_nome,
                          d."Lunedi", d."Martedi", d."Mercoledi",
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica",
                          d."IDsettimana", d."IDseduta"
                   FROM "TdetTecForCor" d
                   LEFT JOIN "TSposizionePiedi"       pp   ON d."IDposizionePiedi"       = pp."IDposizionePiedi"
                   LEFT JOIN "TSdistanza"             dist ON d."IDdistanza"              = dist."IDdistanza"
                   LEFT JOIN "TStarga"                tg   ON d."IDtarga"                 = tg."IDtarga"
                   LEFT JOIN "TSDescrizioneEsercizio" de   ON d."IDdescrizioneEsercizio"  = de."IDdescrizioneEsercizio"
                   WHERE d."IDallenamento" = %s
                   ORDER BY d."IDdetTecForCor"''',
                (id_allenamento,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_all_fis_for_res_con_nomi(id_allenamento: int):
    """AllFisForRes con nomi: tabella numero + descrizione esercizio."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d."IDdetAllFisForRes",
                          tn."NumeroTabella",
                          de."DescrizioneEsercizio",
                          d."Lunedi", d."Martedi", d."Mercoledi",
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica",
                          d."IDsettimana", d."IDseduta"
                   FROM "TdetAllFisForRes" d
                   LEFT JOIN "TStabellaNumero"                       tn ON d."IDtabella_n"                          = tn."IDtabella_n"
                   LEFT JOIN "TSdescrizioneEsercizioAllFisForRes"    de ON d."IDdescrizioneEsercizioAllFisForRes"    = de."IDdescrizioneEsercizioAllFisForRes"
                   WHERE d."IDallenamento" = %s
                   ORDER BY d."IDdetAllFisForRes"''',
                (id_allenamento,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_all_fis_cor_con_nomi(id_allenamento: int):
    """AllFisCor con nomi: attrezzo + descrizione esercizio."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d."IDdetAllFisCor",
                          att."AttrezzoDes",
                          de."DescrizioneEsercizio",
                          d."Lunedi", d."Martedi", d."Mercoledi",
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica",
                          d."IDsettimana", d."IDseduta"
                   FROM "TdetAllFisCor" d
                   LEFT JOIN "TSattrezzi"             att ON d."IDattrezzo"                       = att."IDattrezzo"
                   LEFT JOIN "TSdesEsercizioAllFisCor" de ON d."IDdescrizioneEsercizioAllFisCor"  = de."IDdescrizioneEsercizioAllFisCor"
                   WHERE d."IDallenamento" = %s
                   ORDER BY d."IDdetAllFisCor"''',
                (id_allenamento,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_note_allenamento(id_allenamento: int):
    """Nota dell'istruttore e nota personale dell'atleta di tutte le settimane: (IDsettimana, Nota, NotaAtleta)."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDsettimana", "Nota", "NotaAtleta"
                   FROM "TdetNoteAtleta"
                   WHERE "IDallenamento" = %s''',
                (id_allenamento,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def salva_nota_atleta(id_allenamento: int, id_settimana: int, testo: str):
    """Crea o aggiorna la nota personale scritta dall'atleta per una settimana."""
    # Un solo comando (vedi salva_nota in dettaglioallenamenti_repository): aggiorna solo
    # "NotaAtleta" e lascia la nota dell'istruttore, senza mai creare una seconda riga.
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TdetNoteAtleta" ("IDallenamento", "IDsettimana", "NotaAtleta")
                   VALUES (%s, %s, %s)
                   ON CONFLICT ("IDallenamento", "IDsettimana")
                   DO UPDATE SET "NotaAtleta" = EXCLUDED."NotaAtleta"''',
                (id_allenamento, id_settimana, testo)
            )
            return True
    finally:
        conn.close()
