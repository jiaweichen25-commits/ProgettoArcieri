from config.database import get_db_conn


<<<<<<< HEAD
def _get_all(sql):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
=======
# ─────────────────────────────────────────
# Lookup tables — letture (usate per popolare i dropdown)
# ─────────────────────────────────────────

def get_lookup_stretching():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDesercizioStretching", "NomeEsercizio" FROM "TSstretching" ORDER BY "NomeEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_riscaldamento():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDesercizioRiscaldamento", "NomeEsercizio" FROM "TSriscaldamento" ORDER BY "NomeEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_distanza():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDdistanza", "NomeEsercizio" FROM "TSdistanza" ORDER BY "NomeEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_targa():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDtarga", "NomeTarga" FROM "TStarga" ORDER BY "NomeTarga"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_descrizione_esercizio():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDdescrizioneEsercizio", "NomeEsercizio" FROM "TSDescrizioneEsercizio" ORDER BY "NomeEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_tabella_numero():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDtabella_n", "NumeroTabella" FROM "TStabellaNumero" ORDER BY "NumeroTabella"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_desc_esercizio_all_fis_for_res():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDdescrizioneEsercizioAllFisForRes", "DescrizioneEsercizio" FROM "TSdescrizioneEsercizioAllFisForRes" ORDER BY "DescrizioneEsercizio"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_attrezzi():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDattrezzo", "AttrezzoDes" FROM "TSattrezzi" ORDER BY "AttrezzoDes"')
            return cur.fetchall()
    finally:
        conn.close()

def get_lookup_desc_esercizio_all_fis_cor():
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "IDdescrizioneEsercizioAllFisCor", "DescrizioneEsercizio" FROM "TSdesEsercizioAllFisCor" ORDER BY "DescrizioneEsercizio"')
>>>>>>> 405617e (operazioni crud per le lookup)
            return cur.fetchall()
    finally:
        conn.close()


<<<<<<< HEAD
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
=======
# ─────────────────────────────────────────
# Lookup tables — create / delete (gestite dall'istruttore in UI)
# ─────────────────────────────────────────

def crea_lookup_stretching(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSstretching" ("NomeEsercizio") VALUES (%s) RETURNING "IDesercizioStretching", "NomeEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_stretching(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSstretching" WHERE "IDesercizioStretching" = %s', (id_,))
>>>>>>> 405617e (operazioni crud per le lookup)
            return cur.rowcount > 0
    finally:
        conn.close()

<<<<<<< HEAD

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
=======
def crea_lookup_riscaldamento(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSriscaldamento" ("NomeEsercizio") VALUES (%s) RETURNING "IDesercizioRiscaldamento", "NomeEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_riscaldamento(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSriscaldamento" WHERE "IDesercizioRiscaldamento" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_distanza(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSdistanza" ("NomeEsercizio") VALUES (%s) RETURNING "IDdistanza", "NomeEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_distanza(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSdistanza" WHERE "IDdistanza" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_targa(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TStarga" ("NomeTarga") VALUES (%s) RETURNING "IDtarga", "NomeTarga"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_targa(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TStarga" WHERE "IDtarga" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_descrizione_esercizio(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSDescrizioneEsercizio" ("NomeEsercizio") VALUES (%s) RETURNING "IDdescrizioneEsercizio", "NomeEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_descrizione_esercizio(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSDescrizioneEsercizio" WHERE "IDdescrizioneEsercizio" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_tabella_numero(numero: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TStabellaNumero" ("NumeroTabella") VALUES (%s) RETURNING "IDtabella_n", "NumeroTabella"',
                (numero,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_tabella_numero(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TStabellaNumero" WHERE "IDtabella_n" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_desc_esercizio_all_fis_for_res(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSdescrizioneEsercizioAllFisForRes" ("DescrizioneEsercizio") VALUES (%s) RETURNING "IDdescrizioneEsercizioAllFisForRes", "DescrizioneEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_desc_esercizio_all_fis_for_res(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSdescrizioneEsercizioAllFisForRes" WHERE "IDdescrizioneEsercizioAllFisForRes" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_attrezzi(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSattrezzi" ("AttrezzoDes") VALUES (%s) RETURNING "IDattrezzo", "AttrezzoDes"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_attrezzi(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSattrezzi" WHERE "IDattrezzo" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()

def crea_lookup_desc_esercizio_all_fis_cor(nome: str):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "TSdesEsercizioAllFisCor" ("DescrizioneEsercizio") VALUES (%s) RETURNING "IDdescrizioneEsercizioAllFisCor", "DescrizioneEsercizio"',
                (nome,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def elimina_lookup_desc_esercizio_all_fis_cor(id_: int):
    conn = get_db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute('DELETE FROM "TSdesEsercizioAllFisCor" WHERE "IDdescrizioneEsercizioAllFisCor" = %s', (id_,))
            return cur.rowcount > 0
    finally:
        conn.close()
>>>>>>> 405617e (operazioni crud per le lookup)
