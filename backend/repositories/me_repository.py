from config.database import get_db_conn


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


def get_stretching_con_nomi(id_allenamento: int, id_settimana: int, id_seduta: int):
    """Stretching con nome esercizio risolto via LEFT JOIN."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d."IDdetStretching",
                          lk."NomeEsercizio",
                          d."Lunedi", d."Martedi", d."Mercoledi",
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica"
                   FROM "TdetStretching" d
                   LEFT JOIN "TSstretching" lk
                          ON d."IDesercizioStretching" = lk."IDesercizioStretching"
                   WHERE d."IDallenamento" = %s
                     AND d."IDsettimana"   = %s
                     AND d."IDseduta"      = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_riscaldamento_con_nomi(id_allenamento: int, id_settimana: int, id_seduta: int):
    """Riscaldamento con nome esercizio risolto via LEFT JOIN."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d."IDdetRiscaldamento",
                          lk."NomeEsercizio",
                          d."Lunedi", d."Martedi", d."Mercoledi",
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica"
                   FROM "TdetRiscaldamento" d
                   LEFT JOIN "TSriscaldamento" lk
                          ON d."IDesercizioRiscaldamento" = lk."IDesercizioRiscaldamento"
                   WHERE d."IDallenamento" = %s
                     AND d."IDsettimana"   = %s
                     AND d."IDseduta"      = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_tec_for_cor_con_nomi(id_allenamento: int, id_settimana: int, id_seduta: int):
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
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica"
                   FROM "TdetTecForCor" d
                   LEFT JOIN "TSposizionePiedi"       pp   ON d."IDposizionePiedi"       = pp."IDposizionePiedi"
                   LEFT JOIN "TSdistanza"             dist ON d."IDdistanza"              = dist."IDdistanza"
                   LEFT JOIN "TStarga"                tg   ON d."IDtarga"                 = tg."IDtarga"
                   LEFT JOIN "TSDescrizioneEsercizio" de   ON d."IDdescrizioneEsercizio"  = de."IDdescrizioneEsercizio"
                   WHERE d."IDallenamento" = %s
                     AND d."IDsettimana"   = %s
                     AND d."IDseduta"      = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_all_fis_for_res_con_nomi(id_allenamento: int, id_settimana: int, id_seduta: int):
    """AllFisForRes con nomi: tabella numero + descrizione esercizio."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d."IDdetAllFisForRes",
                          tn."NumeroTabella",
                          de."DescrizioneEsercizio",
                          d."Lunedi", d."Martedi", d."Mercoledi",
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica"
                   FROM "TdetAllFisForRes" d
                   LEFT JOIN "TStabellaNumero"                       tn ON d."IDtabella_n"                          = tn."IDtabella_n"
                   LEFT JOIN "TSdescrizioneEsercizioAllFisForRes"    de ON d."IDdescrizioneEsercizioAllFisForRes"    = de."IDdescrizioneEsercizioAllFisForRes"
                   WHERE d."IDallenamento" = %s
                     AND d."IDsettimana"   = %s
                     AND d."IDseduta"      = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_all_fis_cor_con_nomi(id_allenamento: int, id_settimana: int, id_seduta: int):
    """AllFisCor con nomi: attrezzo + descrizione esercizio."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT d."IDdetAllFisCor",
                          att."AttrezzoDes",
                          de."DescrizioneEsercizio",
                          d."Lunedi", d."Martedi", d."Mercoledi",
                          d."Giovedi", d."Venerdi", d."Sabato", d."Domenica"
                   FROM "TdetAllFisCor" d
                   LEFT JOIN "TSattrezzi"             att ON d."IDattrezzo"                       = att."IDattrezzo"
                   LEFT JOIN "TSdesEsercizioAllFisCor" de ON d."IDdescrizioneEsercizioAllFisCor"  = de."IDdescrizioneEsercizioAllFisCor"
                   WHERE d."IDallenamento" = %s
                     AND d."IDsettimana"   = %s
                     AND d."IDseduta"      = %s''',
                (id_allenamento, id_settimana, id_seduta)
            )
            return cur.fetchall()
    finally:
        conn.close()


def get_nota_allenamento(id_allenamento: int, id_settimana: int):
    """Nota dell'atleta per una settimana."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT "IDnota", "Nota"
                   FROM "TdetNoteAtleta"
                   WHERE "IDallenamento" = %s AND "IDsettimana" = %s''',
                (id_allenamento, id_settimana)
            )
            return cur.fetchone()
    finally:
        conn.close()
