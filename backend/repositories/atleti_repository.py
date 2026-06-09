from config.database import get_db_conn
from typing import Optional
from datetime import date


def _row_to_dict(a, istruttore_email: str = "") -> dict:
    return {
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
        "istruttoreEmail": istruttore_email,
    }


def get_atleti_by_istr_email(email: str):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT a."IDatleta", a."IDistruttore", a."Nome", a."Cognome",
               a."Indirizzo", a."CAP", a."CITTA", a."Codice_Fiscale",
               a."Telefono", a."Cellulare", a."E-mail", a."DataNascita", a."Foto"
        FROM "Tatleti" a
        JOIN "Tistruttori" i ON i."IDistruttore" = a."IDistruttore"
        JOIN "Tutenti" u ON u."IDutente" = i."IDutente"
        WHERE u."E-mail" = %s
        ORDER BY a."IDatleta"
    ''', (email,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_row_to_dict(r, email) for r in rows]


def create_atleta(istr_id: int, nome: str, cognome: str, indirizzo: Optional[str],
                  cap: Optional[str], citta: Optional[str], cf: Optional[str],
                  telefono: Optional[str], cellulare: Optional[str],
                  email: Optional[str], data_nascita: Optional[date]) -> int:
    conn = get_db_conn()
    cur = conn.cursor()
    cap_int = int(cap) if cap and cap.isdigit() else None
    cur.execute('''
        INSERT INTO "Tatleti"
            ("IDistruttore","Nome","Cognome","Indirizzo","CAP","CITTA",
             "Codice_Fiscale","Telefono","Cellulare","E-mail","DataNascita","Foto")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING "IDatleta"
    ''', (istr_id, nome, cognome, indirizzo, cap_int, citta,
          cf, telefono, cellulare, email, data_nascita, "👤"))
    new_id = cur.fetchone()[0]
    # Collega automaticamente all'account utente se l'email coincide
    if email:
        cur.execute(
            'UPDATE "Tatleti" SET "IDutente" = (SELECT "IDutente" FROM "Tutenti" WHERE "E-mail" = %s LIMIT 1) WHERE "IDatleta" = %s AND "IDutente" IS NULL',
            (email, new_id)
        )
    conn.commit()
    cur.close()
    conn.close()
    return new_id


def update_atleta(atleta_id: int, istr_id: int, nome: Optional[str], cognome: Optional[str],
                  indirizzo: Optional[str], cap: Optional[str], citta: Optional[str],
                  cf: Optional[str], telefono: Optional[str], cellulare: Optional[str],
                  email: Optional[str], data_nascita: Optional[date]):
    conn = get_db_conn()
    cur = conn.cursor()
    cap_int = int(cap) if cap and cap.isdigit() else None
    cur.execute('''
        UPDATE "Tatleti"
        SET "Nome"=%s,"Cognome"=%s,"Indirizzo"=%s,"CAP"=%s,"CITTA"=%s,
            "Codice_Fiscale"=%s,"Telefono"=%s,"Cellulare"=%s,"E-mail"=%s,"DataNascita"=%s
        WHERE "IDatleta"=%s AND "IDistruttore"=%s
    ''', (nome, cognome, indirizzo, cap_int, citta,
          cf, telefono, cellulare, email, data_nascita,
          atleta_id, istr_id))
    conn.commit()
    cur.close()
    conn.close()


def delete_atleta(atleta_id: int, istr_id: int):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('DELETE FROM "Tatleti" WHERE "IDatleta"=%s AND "IDistruttore"=%s',
                (atleta_id, istr_id))
    conn.commit()
    cur.close()
    conn.close()
