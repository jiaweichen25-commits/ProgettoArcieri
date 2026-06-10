from config.database import get_db_conn

_COLONNE_SELECT = '''
    "IDmateriale", "IDatleta", "Riser", "LunghezzaRiser", "Flettenti", "LunghezzaFlettenti",
    "PotenzaNominale", "Rest", "Mirino", "Stabilizzazione", "Aste", "LunghezzaAste",
    "Punte", "PesoPunte", "Cocche", "Alette", "LunghezzaAlette", "Spine", "Corda", "Fili",
    "Patella", "Bottone", "Molla", "TillerSuperiore", "TillerInferiore", "Brace", "Allungo",
    "PotenzaReale", "PuntoIncocco", "Data", "MaterialeCorrente"
'''

_COLONNE_INSERT = '''
    "IDatleta", "Riser", "LunghezzaRiser", "Flettenti", "LunghezzaFlettenti",
    "PotenzaNominale", "Rest", "Mirino", "Stabilizzazione", "Aste", "LunghezzaAste",
    "Punte", "PesoPunte", "Cocche", "Alette", "LunghezzaAlette", "Spine", "Corda", "Fili",
    "Patella", "Bottone", "Molla", "TillerSuperiore", "TillerInferiore", "Brace", "Allungo",
    "PotenzaReale", "PuntoIncocco", "Data", "MaterialeCorrente"
'''

def _valori_da_dict(id_atleta: int, dati: dict) -> tuple:
    return (
        id_atleta,
        dati.get("riser"), dati.get("lunghezza_riser"), dati.get("flettenti"),
        dati.get("lunghezza_flettenti"), dati.get("potenza_nominale"), dati.get("rest"),
        dati.get("mirino"), dati.get("stabilizzazione"), dati.get("aste"),
        dati.get("lunghezza_aste"), dati.get("punte"), dati.get("peso_punte"),
        dati.get("cocche"), dati.get("alette"), dati.get("lunghezza_alette"),
        dati.get("spine"), dati.get("corda"), dati.get("fili"), dati.get("patella"),
        dati.get("bottone"), dati.get("molla"), dati.get("tiller_superiore"),
        dati.get("tiller_inferiore"), dati.get("brace"), dati.get("allungo"),
        dati.get("potenza_reale"), dati.get("punto_incocco"), dati.get("data"),
        dati.get("materiale_corrente", False),
    )

def get_materiali_by_atleta(id_atleta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f'''SELECT {_COLONNE_SELECT}
                    FROM "Tmateriali"
                    WHERE "IDatleta" = %s
                    ORDER BY "Data" DESC, "IDmateriale" DESC''',
                (id_atleta,)
            )
            return cur.fetchall()
    finally:
        conn.close()

def get_materiale_by_id(id_materiale: int, id_atleta: int):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f'''SELECT {_COLONNE_SELECT}
                    FROM "Tmateriali"
                    WHERE "IDmateriale" = %s AND "IDatleta" = %s''',
                (id_materiale, id_atleta)
            )
            return cur.fetchone()
    finally:
        conn.close()

def reset_materiale_corrente(id_atleta: int, escluso_id: int = None):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            if escluso_id is not None:
                cur.execute(
                    '''UPDATE "Tmateriali" SET "MaterialeCorrente" = false
                       WHERE "IDatleta" = %s AND "IDmateriale" != %s''',
                    (id_atleta, escluso_id)
                )
            else:
                cur.execute(
                    'UPDATE "Tmateriali" SET "MaterialeCorrente" = false WHERE "IDatleta" = %s',
                    (id_atleta,)
                )
    finally:
        conn.close()

def crea_materiale(id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            placeholders = ", ".join(["%s"] * 30)
            cur.execute(
                f'''INSERT INTO "Tmateriali" ({_COLONNE_INSERT})
                    VALUES ({placeholders})
                    RETURNING "IDmateriale"''',
                _valori_da_dict(id_atleta, dati)
            )
            return cur.fetchone()[0]
    finally:
        conn.close()

def modifica_materiale(id_materiale: int, id_atleta: int, dati: dict):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''UPDATE "Tmateriali"
                   SET "Riser" = %s, "LunghezzaRiser" = %s, "Flettenti" = %s,
                       "LunghezzaFlettenti" = %s, "PotenzaNominale" = %s, "Rest" = %s,
                       "Mirino" = %s, "Stabilizzazione" = %s, "Aste" = %s, "LunghezzaAste" = %s,
                       "Punte" = %s, "PesoPunte" = %s, "Cocche" = %s, "Alette" = %s,
                       "LunghezzaAlette" = %s, "Spine" = %s, "Corda" = %s, "Fili" = %s,
                       "Patella" = %s, "Bottone" = %s, "Molla" = %s,
                       "TillerSuperiore" = %s, "TillerInferiore" = %s, "Brace" = %s,
                       "Allungo" = %s, "PotenzaReale" = %s, "PuntoIncocco" = %s,
                       "Data" = %s, "MaterialeCorrente" = %s
                   WHERE "IDmateriale" = %s AND "IDatleta" = %s''',
                (
                    dati.get("riser"), dati.get("lunghezza_riser"), dati.get("flettenti"),
                    dati.get("lunghezza_flettenti"), dati.get("potenza_nominale"), dati.get("rest"),
                    dati.get("mirino"), dati.get("stabilizzazione"), dati.get("aste"),
                    dati.get("lunghezza_aste"), dati.get("punte"), dati.get("peso_punte"),
                    dati.get("cocche"), dati.get("alette"), dati.get("lunghezza_alette"),
                    dati.get("spine"), dati.get("corda"), dati.get("fili"), dati.get("patella"),
                    dati.get("bottone"), dati.get("molla"), dati.get("tiller_superiore"),
                    dati.get("tiller_inferiore"), dati.get("brace"), dati.get("allungo"),
                    dati.get("potenza_reale"), dati.get("punto_incocco"), dati.get("data"),
                    dati.get("materiale_corrente", False),
                    id_materiale, id_atleta
                )
            )
            return cur.rowcount > 0
    finally:
        conn.close()

def elimina_materiale(id_materiale: int, id_atleta: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'DELETE FROM "Tmateriali" WHERE "IDmateriale" = %s AND "IDatleta" = %s',
                (id_materiale, id_atleta)
            )
            return cur.rowcount > 0
    finally:
        conn.close()
