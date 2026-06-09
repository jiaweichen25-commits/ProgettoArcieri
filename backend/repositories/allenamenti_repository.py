from config.database import get_db_conn
from datetime import date
from typing import Optional


def get_allenamenti_by_atleta(atleta_id: int, istr_id: int):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT a."IDallenamento", a."IDatleta", a."DataInizio", a."DataFine", a."Obiettivi"
        FROM "Tallenamenti" a
        JOIN "Tatleti" t ON t."IDatleta" = a."IDatleta"
        WHERE a."IDatleta" = %s AND t."IDistruttore" = %s
        ORDER BY a."DataInizio" DESC
    ''', (atleta_id, istr_id))
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


def create_allenamento(atleta_id: int, data_inizio: date, data_fine: date,
                       obiettivi: Optional[str]) -> int:
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO "Tallenamenti" ("IDatleta","DataInizio","DataFine","Obiettivi")
        VALUES (%s,%s,%s,%s)
        RETURNING "IDallenamento"
    ''', (atleta_id, data_inizio, data_fine, obiettivi))
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return new_id
