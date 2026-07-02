from repositories import dettaglioallenamenti_repository as repo, allenamenti_repository, atleti_repository
from fastapi import HTTPException, status


def _get_istruttore_or_404(id_utente: int) -> int:
    id_istruttore = atleti_repository.get_id_istruttore_by_utente(id_utente)
    if not id_istruttore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo istruttore non trovato"
        )
    return id_istruttore

def _verifica_allenamento(id_allenamento: int, id_istruttore: int):
    rows = allenamenti_repository.get_allenamenti_by_atleta_istruttore(id_istruttore)
    ids = {row[0] for row in rows}
    if id_allenamento not in ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allenamento non trovato o non appartiene a questo istruttore"
        )

def _autorizza(id_utente: int, id_allenamento: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_allenamento(id_allenamento, id_istruttore)


# ─────────────────────────────────────────
# TdetAllenamenti  (la riga griglia)
# ─────────────────────────────────────────

def get_sedute(id_utente: int, id_allenamento: int, id_settimana: int):
    _autorizza(id_utente, id_allenamento)
    righe = repo.get_sedute(id_allenamento, id_settimana)
    return [
        {
            "IDallenamento": r[0],
            "IDsettimana":   r[1],
            "IDseduta":      r[2],
        }
        for r in righe
    ]

def crea_seduta(id_utente: int, id_allenamento: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    return repo.crea_seduta(id_allenamento, dati)

def elimina_seduta(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int):
    _autorizza(id_utente, id_allenamento)
    ok = repo.elimina_seduta(id_allenamento, id_settimana, id_seduta)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seduta non trovata")


# ─────────────────────────────────────────
# TdetStretching
# ─────────────────────────────────────────

def get_stretching(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int):
    _autorizza(id_utente, id_allenamento)
    righe = repo.get_stretching(id_allenamento, id_settimana, id_seduta)
    return [
        {
            "IDdetStretching":       r[0],
            "IDallenamento":         r[1],
            "IDsettimana":           r[2],
            "IDseduta":              r[3],
            "lunedi":                r[4],
            "martedi":               r[5],
            "mercoledi":             r[6],
            "giovedi":               r[7],
            "venerdi":               r[8],
            "sabato":                r[9],
            "domenica":              r[10],
            "id_esercizio_stretching": r[11],
        }
        for r in righe
    ]

def crea_stretching(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    id_nuovo = repo.crea_stretching(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetStretching": id_nuovo}

def modifica_stretching(id_utente: int, id_allenamento: int, id_det: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    ok = repo.modifica_stretching(id_det, id_allenamento, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record stretching non trovato")

def elimina_stretching(id_utente: int, id_allenamento: int, id_det: int):
    _autorizza(id_utente, id_allenamento)
    ok = repo.elimina_stretching(id_det, id_allenamento)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record stretching non trovato")


# ─────────────────────────────────────────
# TdetRiscaldamento
# ─────────────────────────────────────────

def get_riscaldamento(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int):
    _autorizza(id_utente, id_allenamento)
    righe = repo.get_riscaldamento(id_allenamento, id_settimana, id_seduta)
    return [
        {
            "IDdetRiscaldamento":        r[0],
            "IDallenamento":             r[1],
            "IDsettimana":               r[2],
            "IDseduta":                  r[3],
            "lunedi":                    r[4],
            "martedi":                   r[5],
            "mercoledi":                 r[6],
            "giovedi":                   r[7],
            "venerdi":                   r[8],
            "sabato":                    r[9],
            "domenica":                  r[10],
            "id_esercizio_riscaldamento": r[11],
        }
        for r in righe
    ]

def crea_riscaldamento(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    id_nuovo = repo.crea_riscaldamento(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetRiscaldamento": id_nuovo}

def modifica_riscaldamento(id_utente: int, id_allenamento: int, id_det: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    ok = repo.modifica_riscaldamento(id_det, id_allenamento, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record riscaldamento non trovato")

def elimina_riscaldamento(id_utente: int, id_allenamento: int, id_det: int):
    _autorizza(id_utente, id_allenamento)
    ok = repo.elimina_riscaldamento(id_det, id_allenamento)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record riscaldamento non trovato")


# ─────────────────────────────────────────
# TdetTecForCor
# ─────────────────────────────────────────

def get_tec_for_cor(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int):
    _autorizza(id_utente, id_allenamento)
    righe = repo.get_tec_for_cor(id_allenamento, id_settimana, id_seduta)
    return [
        {
            "IDdetTecForCor":            r[0],
            "IDallenamento":             r[1],
            "IDsettimana":               r[2],
            "IDseduta":                  r[3],
            "id_posizione_piedi":        r[4],
            "lunedi":                    r[5],
            "martedi":                   r[6],
            "mercoledi":                 r[7],
            "giovedi":                   r[8],
            "venerdi":                   r[9],
            "sabato":                    r[10],
            "domenica":                  r[11],
            "id_distanza":               r[12],
            "id_targa":                  r[13],
            "id_descrizione_esercizio":  r[14],
        }
        for r in righe
    ]

def crea_tec_for_cor(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    id_nuovo = repo.crea_tec_for_cor(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetTecForCor": id_nuovo}

def modifica_tec_for_cor(id_utente: int, id_allenamento: int, id_det: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    ok = repo.modifica_tec_for_cor(id_det, id_allenamento, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record TecForCor non trovato")

def elimina_tec_for_cor(id_utente: int, id_allenamento: int, id_det: int):
    _autorizza(id_utente, id_allenamento)
    ok = repo.elimina_tec_for_cor(id_det, id_allenamento)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record TecForCor non trovato")


# ─────────────────────────────────────────
# TdetAllFisForRes
# ─────────────────────────────────────────

def get_all_fis_for_res(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int):
    _autorizza(id_utente, id_allenamento)
    righe = repo.get_all_fis_for_res(id_allenamento, id_settimana, id_seduta)
    return [
        {
            "IDdetAllFisForRes":                        r[0],
            "IDallenamento":                            r[1],
            "IDsettimana":                              r[2],
            "IDseduta":                                 r[3],
            "lunedi":                                   r[4],
            "martedi":                                  r[5],
            "mercoledi":                                r[6],
            "giovedi":                                  r[7],
            "venerdi":                                  r[8],
            "sabato":                                   r[9],
            "domenica":                                 r[10],
            "id_tabella_n":                             r[11],
            "id_descrizione_esercizio_all_fis_for_res": r[12],
        }
        for r in righe
    ]

def crea_all_fis_for_res(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    id_nuovo = repo.crea_all_fis_for_res(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetAllFisForRes": id_nuovo}

def modifica_all_fis_for_res(id_utente: int, id_allenamento: int, id_det: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    ok = repo.modifica_all_fis_for_res(id_det, id_allenamento, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record AllFisForRes non trovato")

def elimina_all_fis_for_res(id_utente: int, id_allenamento: int, id_det: int):
    _autorizza(id_utente, id_allenamento)
    ok = repo.elimina_all_fis_for_res(id_det, id_allenamento)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record AllFisForRes non trovato")


# ─────────────────────────────────────────
# TdetAllFisCor
# ─────────────────────────────────────────

def get_all_fis_cor(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int):
    _autorizza(id_utente, id_allenamento)
    righe = repo.get_all_fis_cor(id_allenamento, id_settimana, id_seduta)
    return [
        {
            "IDdetAllFisCor":                       r[0],
            "IDallenamento":                        r[1],
            "IDsettimana":                          r[2],
            "IDseduta":                             r[3],
            "id_attrezzo":                          r[4],
            "lunedi":                               r[5],
            "martedi":                              r[6],
            "mercoledi":                            r[7],
            "giovedi":                              r[8],
            "venerdi":                              r[9],
            "sabato":                               r[10],
            "domenica":                             r[11],
            "id_descrizione_esercizio_all_fis_cor": r[12],
        }
        for r in righe
    ]

def crea_all_fis_cor(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    id_nuovo = repo.crea_all_fis_cor(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetAllFisCor": id_nuovo}

def modifica_all_fis_cor(id_utente: int, id_allenamento: int, id_det: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    ok = repo.modifica_all_fis_cor(id_det, id_allenamento, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record AllFisCor non trovato")

def elimina_all_fis_cor(id_utente: int, id_allenamento: int, id_det: int):
    _autorizza(id_utente, id_allenamento)
    ok = repo.elimina_all_fis_cor(id_det, id_allenamento)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record AllFisCor non trovato")


# ─────────────────────────────────────────
# TdetNoteAtleta
# ─────────────────────────────────────────

def get_nota(id_utente: int, id_allenamento: int, id_settimana: int):
    _autorizza(id_utente, id_allenamento)
    r = repo.get_nota(id_allenamento, id_settimana)
    if r is None:
        return None
    return {
        "IDnota":        r[0],
        "IDallenamento": r[1],
        "IDsettimana":   r[2],
        "nota":          r[3],
    }

def salva_nota(id_utente: int, id_allenamento: int, id_settimana: int, dati: dict):
    _autorizza(id_utente, id_allenamento)
    # Se esiste già la aggiorna, altrimenti la crea
    esistente = repo.get_nota(id_allenamento, id_settimana)
    if esistente is None:
        id_nuovo = repo.crea_nota(id_allenamento, id_settimana, dati)
        return {"IDnota": id_nuovo}
    else:
        repo.modifica_nota(esistente[0], dati)
        return {"IDnota": esistente[0]}

def crea_seduta_se_non_esiste(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int):
    _autorizza(id_utente, id_allenamento)
    repo.crea_seduta_se_non_esiste(id_allenamento, id_settimana, id_seduta)

def get_totale_frecce(id_utente: int, id_allenamento: int, id_settimana: int, id_seduta: int):
    _autorizza(id_utente, id_allenamento)
    r = repo.get_totale_frecce(id_allenamento, id_settimana, id_seduta)
    giorni = {
        "lunedi":    r[0],
        "martedi":   r[1],
        "mercoledi": r[2],
        "giovedi":   r[3],
        "venerdi":   r[4],
        "sabato":    r[5],
        "domenica":  r[6],
    }
    giorni["totale"] = sum(giorni.values())
    return giorni
