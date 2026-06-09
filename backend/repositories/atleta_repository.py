from config.database import get_db_conn


def get_atleta_by_email(email: str):
    """Find the Tatleti record for a logged-in athlete by matching email."""
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT a."IDatleta", a."IDistruttore", a."Nome", a."Cognome",
               a."Indirizzo", a."CAP", a."CITTA", a."Codice_Fiscale",
               a."Telefono", a."Cellulare", a."E-mail", a."DataNascita", a."Foto"
        FROM "Tatleti" a
        LEFT JOIN "Tutenti" u ON u."IDutente" = a."IDutente"
        WHERE u."E-mail" = %s OR a."E-mail" = %s
        LIMIT 1
    ''', (email, email))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None
    return {
        "IDatleta":       row[0],
        "IDistruttore":   row[1],
        "Nome":           row[2] or "",
        "Cognome":        row[3] or "",
        "Indirizzo":      row[4] or "",
        "CAP":            str(row[5]) if row[5] is not None else "",
        "CITTA":          row[6] or "",
        "Codice_Fiscale": row[7] or "",
        "Telefono":       row[8] or "",
        "Cellulare":      row[9] or "",
        "E-mail":         row[10] or "",
        "DataNascita":    str(row[11]) if row[11] else "",
        "Foto":           row[12] or "👤",
    }


def get_allenamenti_atleta(atleta_id: int):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT "IDallenamento", "IDatleta", "DataInizio", "DataFine", "Obiettivi"
        FROM "Tallenamenti"
        WHERE "IDatleta" = %s
        ORDER BY "DataInizio" DESC
    ''', (atleta_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "IDallenamento": r[0],
            "IDatleta":      r[1],
            "DataInizio":    str(r[2]),
            "DataFine":      str(r[3]),
            "Obiettivi":     r[4] or "",
        }
        for r in rows
    ]


def get_materiali_atleta(atleta_id: int):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT "IDmateriale","Riser","LunghezzaRiser","Flettenti","LunghezzaFlettenti",
               "PotenzaNominale","Rest","Mirino","Stabilizzazione","Aste","LunghezzaAste",
               "Punte","PesoPunte","Cocche","Alette","LunghezzaAlette","Spine","Corda",
               "Fili","Patella","Bottone","Molla","TillerSuperiore","TillerInferiore",
               "Brace","Allungo","PotenzaReale","PuntoIncocco","Data","MaterialeCorrente"
        FROM "Tmateriali"
        WHERE "IDatleta" = %s
        ORDER BY "MaterialeCorrente" DESC, "Data" DESC
    ''', (atleta_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    cols = ["IDmateriale","Riser","LunghezzaRiser","Flettenti","LunghezzaFlettenti",
            "PotenzaNominale","Rest","Mirino","Stabilizzazione","Aste","LunghezzaAste",
            "Punte","PesoPunte","Cocche","Alette","LunghezzaAlette","Spine","Corda",
            "Fili","Patella","Bottone","Molla","TillerSuperiore","TillerInferiore",
            "Brace","Allungo","PotenzaReale","PuntoIncocco","Data","MaterialeCorrente"]
    result = []
    for r in rows:
        d = dict(zip(cols, r))
        d["Data"] = str(d["Data"]) if d["Data"] else ""
        result.append(d)
    return result


def create_materiale(atleta_id: int, data: dict) -> int:
    conn = get_db_conn()
    cur = conn.cursor()
    if data.get("MaterialeCorrente"):
        cur.execute('UPDATE "Tmateriali" SET "MaterialeCorrente" = false WHERE "IDatleta" = %s', (atleta_id,))
    cur.execute('''
        INSERT INTO "Tmateriali" (
            "IDatleta","Riser","LunghezzaRiser","Flettenti","LunghezzaFlettenti",
            "PotenzaNominale","Rest","Mirino","Stabilizzazione","Aste","LunghezzaAste",
            "Punte","PesoPunte","Cocche","Alette","LunghezzaAlette","Spine","Corda",
            "Fili","Patella","Bottone","Molla","TillerSuperiore","TillerInferiore",
            "Brace","Allungo","PotenzaReale","PuntoIncocco","Data","MaterialeCorrente"
        ) VALUES (
            %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
        ) RETURNING "IDmateriale"
    ''', (
        atleta_id,
        data.get("Riser"), data.get("LunghezzaRiser"), data.get("Flettenti"), data.get("LunghezzaFlettenti"),
        data.get("PotenzaNominale"), data.get("Rest"), data.get("Mirino"), data.get("Stabilizzazione"),
        data.get("Aste"), data.get("LunghezzaAste"), data.get("Punte"), data.get("PesoPunte"),
        data.get("Cocche"), data.get("Alette"), data.get("LunghezzaAlette"), data.get("Spine"),
        data.get("Corda"), data.get("Fili"), data.get("Patella"), data.get("Bottone"),
        data.get("Molla"), data.get("TillerSuperiore"), data.get("TillerInferiore"),
        data.get("Brace"), data.get("Allungo"), data.get("PotenzaReale"), data.get("PuntoIncocco"),
        data.get("Data"), data.get("MaterialeCorrente", False),
    ))
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return new_id


def update_materiale(id_materiale: int, atleta_id: int, data: dict):
    conn = get_db_conn()
    cur = conn.cursor()
    if data.get("MaterialeCorrente"):
        cur.execute('UPDATE "Tmateriali" SET "MaterialeCorrente" = false WHERE "IDatleta" = %s', (atleta_id,))
    cur.execute('''
        UPDATE "Tmateriali" SET
            "Riser"=%s,"LunghezzaRiser"=%s,"Flettenti"=%s,"LunghezzaFlettenti"=%s,
            "PotenzaNominale"=%s,"Rest"=%s,"Mirino"=%s,"Stabilizzazione"=%s,
            "Aste"=%s,"LunghezzaAste"=%s,"Punte"=%s,"PesoPunte"=%s,
            "Cocche"=%s,"Alette"=%s,"LunghezzaAlette"=%s,"Spine"=%s,"Corda"=%s,
            "Fili"=%s,"Patella"=%s,"Bottone"=%s,"Molla"=%s,
            "TillerSuperiore"=%s,"TillerInferiore"=%s,"Brace"=%s,"Allungo"=%s,
            "PotenzaReale"=%s,"PuntoIncocco"=%s,"Data"=%s,"MaterialeCorrente"=%s
        WHERE "IDmateriale"=%s AND "IDatleta"=%s
    ''', (
        data.get("Riser"), data.get("LunghezzaRiser"), data.get("Flettenti"), data.get("LunghezzaFlettenti"),
        data.get("PotenzaNominale"), data.get("Rest"), data.get("Mirino"), data.get("Stabilizzazione"),
        data.get("Aste"), data.get("LunghezzaAste"), data.get("Punte"), data.get("PesoPunte"),
        data.get("Cocche"), data.get("Alette"), data.get("LunghezzaAlette"), data.get("Spine"),
        data.get("Corda"), data.get("Fili"), data.get("Patella"), data.get("Bottone"),
        data.get("Molla"), data.get("TillerSuperiore"), data.get("TillerInferiore"),
        data.get("Brace"), data.get("Allungo"), data.get("PotenzaReale"), data.get("PuntoIncocco"),
        data.get("Data"), data.get("MaterialeCorrente", False),
        id_materiale, atleta_id,
    ))
    conn.commit()
    cur.close()
    conn.close()


def delete_materiale(id_materiale: int, atleta_id: int):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('DELETE FROM "Tmateriali" WHERE "IDmateriale"=%s AND "IDatleta"=%s', (id_materiale, atleta_id))
    conn.commit()
    cur.close()
    conn.close()


def get_note_settimana(atleta_id: int, id_allenamento: int, id_settimana: int):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT n."IDnota", n."IDallenamento", n."IDsettimana", n."Nota"
        FROM "TdetNoteAtleta" n
        JOIN "Tallenamenti" a ON a."IDallenamento" = n."IDallenamento"
        WHERE a."IDatleta" = %s AND n."IDallenamento" = %s AND n."IDsettimana" = %s
        ORDER BY n."IDnota"
    ''', (atleta_id, id_allenamento, id_settimana))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"IDnota": r[0], "IDallenamento": r[1], "IDsettimana": r[2], "Nota": r[3]} for r in rows]


def create_nota(id_allenamento: int, id_settimana: int, nota: str) -> int:
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO "TdetNoteAtleta" ("IDallenamento","IDsettimana","Nota")
        VALUES (%s,%s,%s)
        RETURNING "IDnota"
    ''', (id_allenamento, id_settimana, nota))
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return new_id


def delete_nota(id_nota: int, atleta_id: int):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        DELETE FROM "TdetNoteAtleta" n
        USING "Tallenamenti" a
        WHERE n."IDnota" = %s
          AND n."IDallenamento" = a."IDallenamento"
          AND a."IDatleta" = %s
    ''', (id_nota, atleta_id))
    conn.commit()
    cur.close()
    conn.close()
