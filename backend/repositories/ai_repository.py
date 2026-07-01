from config.database import get_db_conn


def get_contesto_atleta(id_atleta: int) -> dict:
    """Raccoglie tutti i dati dell'atleta per costruire il contesto AI."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            # Profilo atleta
            cur.execute(
                '''SELECT a."Nome", a."Cognome", a."DataNascita", a."CITTA",
                          a."Telefono", a."Cellulare", a."E-mail"
                   FROM "Tatleti" a
                   WHERE a."IDatleta" = %s''',
                (id_atleta,)
            )
            profilo = cur.fetchone()

            # Materiale corrente
            cur.execute(
                '''SELECT "Riser", "LunghezzaRiser", "Flettenti", "LunghezzaFlettenti",
                          "PotenzaNominale", "PotenzaReale", "Allungo", "Mirino",
                          "Stabilizzazione", "Corda", "Fili", "Punte", "PesoPunte",
                          "Cocche", "Alette", "Spine", "Brace", "TillerSuperiore",
                          "TillerInferiore", "Bottone", "Molla", "PuntoIncocco", "Data"
                   FROM "Tmateriali"
                   WHERE "IDatleta" = %s
                   ORDER BY "Data" DESC NULLS LAST
                   LIMIT 1''',
                (id_atleta,)
            )
            materiale = cur.fetchone()

            # Allenamenti
            cur.execute(
                '''SELECT "DataInizio", "DataFine", "Obiettivi"
                   FROM "Tallenamenti"
                   WHERE "IDatleta" = %s
                   ORDER BY "DataInizio" DESC
                   LIMIT 5''',
                (id_atleta,)
            )
            allenamenti = cur.fetchall()

            # Visite mediche
            cur.execute(
                '''SELECT "DataVisita", "DataScadenza"
                   FROM "Tvisitemediche"
                   WHERE "IDatleta" = %s
                   ORDER BY "DataVisita" DESC
                   LIMIT 3''',
                (id_atleta,)
            )
            visite = cur.fetchall()

            # Antidoping
            cur.execute(
                '''SELECT "Anno", "AutorizzazioneFitarco", "ScadenzaAutorizzazione"
                   FROM "Tantidoping"
                   WHERE "IDatleta" = %s
                   ORDER BY "Anno" DESC
                   LIMIT 3''',
                (id_atleta,)
            )
            antidoping = cur.fetchall()

            # Piano gare
            cur.execute(
                '''SELECT pg."Data", pg."Luogo", pg."Distanza", pg."Note",
                          tg."Descrizione" AS tipo_gara
                   FROM "Tpianogare" pg
                   LEFT JOIN "TStipigare" tg ON pg."IDtipogara" = tg."IDtipogara"
                   WHERE pg."IDallenamento" IN (
                       SELECT "IDallenamento" FROM "Tallenamenti" WHERE "IDatleta" = %s
                   )
                   AND pg."EscludiVisualizzazione" = false
                   ORDER BY pg."Data" DESC
                   LIMIT 5''',
                (id_atleta,)
            )
            gare = cur.fetchall()

        return {
            "profilo": profilo,
            "materiale": materiale,
            "allenamenti": allenamenti,
            "visite": visite,
            "antidoping": antidoping,
            "gare": gare,
        }
    finally:
        conn.close()


def get_cronologia(id_atleta: int, solo_ruolo: str = None) -> list:
    """Restituisce le ultime 10 conversazioni AI.
    Se solo_ruolo='atleta' filtra solo quelle fatte dall'atleta (nasconde quelle dell'istruttore)."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            if solo_ruolo:
                cur.execute(
                    '''SELECT "IDcronologia", "IDatleta", "Domanda", "RispostaAI", "DataOra"
                       FROM "TcronologiaAI"
                       WHERE "IDatleta" = %s AND "RuoloUtente" = %s
                       ORDER BY "DataOra" DESC
                       LIMIT 10''',
                    (id_atleta, solo_ruolo)
                )
            else:
                cur.execute(
                    '''SELECT "IDcronologia", "IDatleta", "Domanda", "RispostaAI", "DataOra"
                       FROM "TcronologiaAI"
                       WHERE "IDatleta" = %s
                       ORDER BY "DataOra" DESC
                       LIMIT 10''',
                    (id_atleta,)
                )
            rows = cur.fetchall()
            return [
                {
                    "IDcronologia": r[0],
                    "IDatleta": r[1],
                    "Domanda": r[2],
                    "RispostaAI": r[3],
                    "DataOra": r[4],
                }
                for r in reversed(rows)
            ]
    finally:
        conn.close()


def salva_cronologia(id_atleta: int, domanda: str, risposta: str, ruolo: str = 'atleta'):
    """Salva una coppia domanda/risposta nel DB con il ruolo di chi ha chiesto."""
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO "TcronologiaAI" ("IDatleta", "RuoloUtente", "Domanda", "RispostaAI")
                   VALUES (%s, %s, %s, %s)''',
                (id_atleta, ruolo, domanda, risposta)
            )
    finally:
        conn.close()


def get_id_atleta_by_utente(id_utente: int):
    """Restituisce IDatleta dato IDutente."""
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "IDatleta" FROM "Tatleti" WHERE "IDutente" = %s',
                (id_utente,)
            )
            row = cur.fetchone()
            return row[0] if row else None
    finally:
        conn.close()
