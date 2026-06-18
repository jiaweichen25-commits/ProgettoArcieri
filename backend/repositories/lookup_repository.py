from config.database import get_db_conn


def _get_all(sql):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()
    finally:
        conn.close()


def _insert(sql, val):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(sql, (val,))
            return cur.fetchone()[0]
    finally:
        conn.close()


def _delete(sql, id_val):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(sql, (id_val,))
            return cur.rowcount > 0
    finally:
        conn.close()


# ─── TFR ───────────────────────────────────────────────────────────────────────
# Esercizi e ripetizioni usano TSdescrizioneEsercizioAllFisForRes

def get_tfr_exercises():
    return _get_all(
        'SELECT "IDdescrizioneEsercizioAllFisForRes", "DescrizioneEsercizio" '
        'FROM "TSdescrizioneEsercizioAllFisForRes" ORDER BY "IDdescrizioneEsercizioAllFisForRes"'
    )

def add_tfr_exercise(valore: str) -> int:
    return _insert(
        'INSERT INTO "TSdescrizioneEsercizioAllFisForRes" ("DescrizioneEsercizio") '
        'VALUES (%s) RETURNING "IDdescrizioneEsercizioAllFisForRes"',
        valore
    )

def delete_tfr_exercise(id_val: int) -> bool:
    return _delete(
        'DELETE FROM "TSdescrizioneEsercizioAllFisForRes" WHERE "IDdescrizioneEsercizioAllFisForRes" = %s',
        id_val
    )


def get_tfr_tempi():
    return []   # gestito come lista locale nel frontend

def add_tfr_tempo(valore: str) -> int:
    return 0

def delete_tfr_tempo(id_val: int) -> bool:
    return True


def get_tfr_ripetizioni():
    return _get_all(
        'SELECT "IDdescrizioneEsercizioAllFisForRes", "DescrizioneEsercizio" '
        'FROM "TSdescrizioneEsercizioAllFisForRes" ORDER BY "IDdescrizioneEsercizioAllFisForRes"'
    )

def add_tfr_ripetizione(valore: str) -> int:
    return _insert(
        'INSERT INTO "TSdescrizioneEsercizioAllFisForRes" ("DescrizioneEsercizio") '
        'VALUES (%s) RETURNING "IDdescrizioneEsercizioAllFisForRes"',
        valore
    )

def delete_tfr_ripetizione(id_val: int) -> bool:
    return _delete(
        'DELETE FROM "TSdescrizioneEsercizioAllFisForRes" WHERE "IDdescrizioneEsercizioAllFisForRes" = %s',
        id_val
    )


# ─── FC ────────────────────────────────────────────────────────────────────────

def get_fc_atrezzi():
    return _get_all('SELECT "IDattrezzo", "AttrezzoDes" FROM "TSattrezzi" ORDER BY "IDattrezzo"')

def add_fc_atrezzo(valore: str) -> int:
    return _insert('INSERT INTO "TSattrezzi" ("AttrezzoDes") VALUES (%s) RETURNING "IDattrezzo"', valore)

def delete_fc_atrezzo(id_val: int) -> bool:
    return _delete('DELETE FROM "TSattrezzi" WHERE "IDattrezzo" = %s', id_val)


def get_fc_tempi():
    return _get_all('SELECT "IDtempoFisCor", "Valore" FROM "TStempiFisCor" ORDER BY "IDtempoFisCor"')

def add_fc_tempo(valore: str) -> int:
    return _insert('INSERT INTO "TStempiFisCor" ("Valore") VALUES (%s) RETURNING "IDtempoFisCor"', valore)

def delete_fc_tempo(id_val: int) -> bool:
    return _delete('DELETE FROM "TStempiFisCor" WHERE "IDtempoFisCor" = %s', id_val)


def get_fc_descrizione():
    return _get_all(
        'SELECT "IDdescrizioneEsercizioAllFisCor", "DescrizioneEsercizio" '
        'FROM "TSdesEsercizioAllFisCor" ORDER BY "IDdescrizioneEsercizioAllFisCor"'
    )

def add_fc_descrizione(valore: str) -> int:
    return _insert(
        'INSERT INTO "TSdesEsercizioAllFisCor" ("DescrizioneEsercizio") '
        'VALUES (%s) RETURNING "IDdescrizioneEsercizioAllFisCor"',
        valore
    )

def delete_fc_descrizione(id_val: int) -> bool:
    return _delete(
        'DELETE FROM "TSdesEsercizioAllFisCor" WHERE "IDdescrizioneEsercizioAllFisCor" = %s',
        id_val
    )


# ─── TFC ───────────────────────────────────────────────────────────────────────

def get_tfc_piedi():
    return []   # preset gestiti dal frontend

def add_tfc_piede(valore: str) -> int:
    return 0

def delete_tfc_piede(id_val: int) -> bool:
    return True


def get_tfc_distanza():
    return _get_all('SELECT "IDdistanza", "NomeEsercizio" FROM "TSdistanza" ORDER BY "IDdistanza"')

def add_tfc_distanza(valore: str) -> int:
    return _insert('INSERT INTO "TSdistanza" ("NomeEsercizio") VALUES (%s) RETURNING "IDdistanza"', valore)

def delete_tfc_distanza(id_val: int) -> bool:
    return _delete('DELETE FROM "TSdistanza" WHERE "IDdistanza" = %s', id_val)


def get_tfc_targa():
    return _get_all('SELECT "IDtarga", "NomeTarga" FROM "TStarga" ORDER BY "IDtarga"')

def add_tfc_targa(valore: str) -> int:
    return _insert('INSERT INTO "TStarga" ("NomeTarga") VALUES (%s) RETURNING "IDtarga"', valore)

def delete_tfc_targa(id_val: int) -> bool:
    return _delete('DELETE FROM "TStarga" WHERE "IDtarga" = %s', id_val)


def get_tfc_serie():
    return _get_all('SELECT "IDtabella_n", "NumeroTabella" FROM "TStabellaNumero" ORDER BY "IDtabella_n"')

def add_tfc_serie(valore: str) -> int:
    try:
        num = int(valore)
    except (ValueError, TypeError):
        num = 0
    return _insert('INSERT INTO "TStabellaNumero" ("NumeroTabella") VALUES (%s) RETURNING "IDtabella_n"', num)

def delete_tfc_serie(id_val: int) -> bool:
    return _delete('DELETE FROM "TStabellaNumero" WHERE "IDtabella_n" = %s', id_val)


def get_tfc_descrizione():
    return _get_all(
        'SELECT "IDdescrizioneEsercizio", "NomeEsercizio" '
        'FROM "TSDescrizioneEsercizio" ORDER BY "IDdescrizioneEsercizio"'
    )

def add_tfc_descrizione(valore: str) -> int:
    return _insert(
        'INSERT INTO "TSDescrizioneEsercizio" ("NomeEsercizio") VALUES (%s) RETURNING "IDdescrizioneEsercizio"',
        valore
    )

def delete_tfc_descrizione(id_val: int) -> bool:
    return _delete('DELETE FROM "TSDescrizioneEsercizio" WHERE "IDdescrizioneEsercizio" = %s', id_val)


# ─── Riscaldamento / Stretching ────────────────────────────────────────────────

def get_riscaldamento():
    return _get_all(
        'SELECT "IDesercizioRiscaldamento", "NomeEsercizio" '
        'FROM "TSriscaldamento" ORDER BY "IDesercizioRiscaldamento"'
    )

def add_riscaldamento(valore: str) -> int:
    return _insert(
        'INSERT INTO "TSriscaldamento" ("NomeEsercizio") VALUES (%s) RETURNING "IDesercizioRiscaldamento"',
        valore
    )

def delete_riscaldamento(id_val: int) -> bool:
    return _delete('DELETE FROM "TSriscaldamento" WHERE "IDesercizioRiscaldamento" = %s', id_val)


def get_stretching():
    return _get_all(
        'SELECT "IDesercizioStretching", "NomeEsercizio" '
        'FROM "TSstretching" ORDER BY "IDesercizioStretching"'
    )

def add_stretching(valore: str) -> int:
    return _insert(
        'INSERT INTO "TSstretching" ("NomeEsercizio") VALUES (%s) RETURNING "IDesercizioStretching"',
        valore
    )

def delete_stretching(id_val: int) -> bool:
    return _delete('DELETE FROM "TSstretching" WHERE "IDesercizioStretching" = %s', id_val)
