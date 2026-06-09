from config.database import get_db_conn


def get_all_istruttori_with_atleti():
    conn = get_db_conn()
    cur = conn.cursor()

    cur.execute('''
        SELECT i."IDistruttore", i."IDutente", i."Nome", i."Cognome",
               i."Qualifica", i."Cellulare", i."Stato", u."E-mail"
        FROM "Tistruttori" i
        JOIN "Tutenti" u ON u."IDutente" = i."IDutente"
        ORDER BY i."IDistruttore"
    ''')
    istr_rows = cur.fetchall()

    cur.execute('''
        SELECT a."IDatleta", a."IDistruttore", a."Nome", a."Cognome",
               a."Indirizzo", a."CAP", a."CITTA", a."Codice_Fiscale",
               a."Telefono", a."Cellulare", a."E-mail", a."DataNascita", a."Foto"
        FROM "Tatleti" a
        ORDER BY a."IDatleta"
    ''')
    atleti_rows = cur.fetchall()
    cur.close()
    conn.close()

    atleti_by_istr = {}
    for a in atleti_rows:
        atleti_by_istr.setdefault(a[1], []).append(a)

    result = []
    for i in istr_rows:
        istr_id = i[0]
        email   = i[7]
        istr_atleti = [
            {
                "IDatleta":       a[0],
                "IDistruttore":   a[1],
                "Nome":           a[2] or "",
                "Cognome":        a[3] or "",
                "Indirizzo":      a[4] or "",
                "CAP":            str(a[5]) if a[5] is not None else "",
                "CITTA":          a[6] or "",
                "Codice_Fiscale": a[7] or "",
                "Telefono":       a[8] or "",
                "Cellulare":      a[9] or "",
                "E-mail":         a[10] or "",
                "DataNascita":    str(a[11]) if a[11] else "",
                "Foto":           a[12] or "👤",
                "istruttoreEmail": email,
            }
            for a in atleti_by_istr.get(istr_id, [])
        ]
        result.append({
            "IDistruttore": i[0],
            "IDutente":     i[1],
            "Nome":         i[2] or "",
            "Cognome":      i[3] or "",
            "Qualifica":    i[4] or "",
            "Cellulare":    i[5] or "",
            "Stato":        i[6] or "Attivo",
            "E-mail":       email,
            "atleti":       istr_atleti,
        })

    return result


def get_istruttore_id_by_email(email: str):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT i."IDistruttore"
        FROM "Tistruttori" i
        JOIN "Tutenti" u ON u."IDutente" = i."IDutente"
        WHERE u."E-mail" = %s
    ''', (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None


def create_istruttore(id_utente: int):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO "Tistruttori" ("IDutente", "Nome", "Cognome", "Stato")
        VALUES (%s, '', '', 'Attivo')
        RETURNING "IDistruttore"
    ''', (id_utente,))
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return new_id


def update_istruttore(email: str, nome: str, cognome: str, qualifica: str, cellulare: str, stato: str):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        UPDATE "Tistruttori" i
        SET "Nome" = %s, "Cognome" = %s, "Qualifica" = %s, "Cellulare" = %s, "Stato" = %s
        FROM "Tutenti" u
        WHERE i."IDutente" = u."IDutente" AND u."E-mail" = %s
    ''', (nome, cognome, qualifica, cellulare, stato, email))
    conn.commit()
    cur.close()
    conn.close()
