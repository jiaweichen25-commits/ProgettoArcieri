from repositories import dettaglioallenamenti_repository as repo
from fastapi import HTTPException, status


# ─────────────────────────────────────────
# TdetAllenamenti  (la riga griglia)
# ─────────────────────────────────────────

def get_sedute(id_allenamento: int, id_settimana: int):
    righe = repo.get_sedute(id_allenamento, id_settimana)
    return [
        {
            "IDallenamento": r[0],
            "IDsettimana":   r[1],
            "IDseduta":      r[2],
        }
        for r in righe
    ]

def crea_seduta(id_allenamento: int, dati: dict):
    return repo.crea_seduta(id_allenamento, dati)

def elimina_seduta(id_allenamento: int, id_settimana: int, id_seduta: int):
    ok = repo.elimina_seduta(id_allenamento, id_settimana, id_seduta)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seduta non trovata")


# ─────────────────────────────────────────
# TdetStretching
# ─────────────────────────────────────────

def get_stretching(id_allenamento: int, id_settimana: int, id_seduta: int):
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

def crea_stretching(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    id_nuovo = repo.crea_stretching(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetStretching": id_nuovo}

def modifica_stretching(id_det: int, dati: dict):
    ok = repo.modifica_stretching(id_det, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record stretching non trovato")

def elimina_stretching(id_det: int):
    ok = repo.elimina_stretching(id_det)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record stretching non trovato")


# ─────────────────────────────────────────
# TdetRiscaldamento
# ─────────────────────────────────────────

def get_riscaldamento(id_allenamento: int, id_settimana: int, id_seduta: int):
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

def crea_riscaldamento(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    id_nuovo = repo.crea_riscaldamento(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetRiscaldamento": id_nuovo}

def modifica_riscaldamento(id_det: int, dati: dict):
    ok = repo.modifica_riscaldamento(id_det, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record riscaldamento non trovato")

def elimina_riscaldamento(id_det: int):
    ok = repo.elimina_riscaldamento(id_det)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record riscaldamento non trovato")


# ─────────────────────────────────────────
# TdetTecForCor
# ─────────────────────────────────────────

def get_tec_for_cor(id_allenamento: int, id_settimana: int, id_seduta: int):
    righe = repo.get_tec_for_cor(id_allenamento, id_settimana, id_seduta)
    return [
        {
            "IDdetTecForCor":            r[0],
            "IDallenamento":             r[1],
            "IDsettimana":               r[2],
            "IDseduta":                  r[3],
            "posizione_piedi":           r[4],
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

def crea_tec_for_cor(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    id_nuovo = repo.crea_tec_for_cor(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetTecForCor": id_nuovo}

def modifica_tec_for_cor(id_det: int, dati: dict):
    ok = repo.modifica_tec_for_cor(id_det, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record TecForCor non trovato")

def elimina_tec_for_cor(id_det: int):
    ok = repo.elimina_tec_for_cor(id_det)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record TecForCor non trovato")


# ─────────────────────────────────────────
# TdetAllFisForRes
# ─────────────────────────────────────────

def get_all_fis_for_res(id_allenamento: int, id_settimana: int, id_seduta: int):
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

def crea_all_fis_for_res(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    id_nuovo = repo.crea_all_fis_for_res(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetAllFisForRes": id_nuovo}

def modifica_all_fis_for_res(id_det: int, dati: dict):
    ok = repo.modifica_all_fis_for_res(id_det, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record AllFisForRes non trovato")

def elimina_all_fis_for_res(id_det: int):
    ok = repo.elimina_all_fis_for_res(id_det)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record AllFisForRes non trovato")


# ─────────────────────────────────────────
# TdetAllFisCor
# ─────────────────────────────────────────

def get_all_fis_cor(id_allenamento: int, id_settimana: int, id_seduta: int):
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

def crea_all_fis_cor(id_allenamento: int, id_settimana: int, id_seduta: int, dati: dict):
    id_nuovo = repo.crea_all_fis_cor(id_allenamento, id_settimana, id_seduta, dati)
    return {"IDdetAllFisCor": id_nuovo}

def modifica_all_fis_cor(id_det: int, dati: dict):
    ok = repo.modifica_all_fis_cor(id_det, dati)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record AllFisCor non trovato")

def elimina_all_fis_cor(id_det: int):
    ok = repo.elimina_all_fis_cor(id_det)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record AllFisCor non trovato")


# ─────────────────────────────────────────
# TdetNoteAtleta
# ─────────────────────────────────────────

def get_nota(id_allenamento: int, id_settimana: int):
    r = repo.get_nota(id_allenamento, id_settimana)
    if r is None:
        return None
    return {
        "IDnota":        r[0],
        "IDallenamento": r[1],
        "IDsettimana":   r[2],
        "nota":          r[3],
    }

def salva_nota(id_allenamento: int, id_settimana: int, dati: dict):
    # Se esiste già la aggiorna, altrimenti la crea
    esistente = repo.get_nota(id_allenamento, id_settimana)
    if esistente is None:
        id_nuovo = repo.crea_nota(id_allenamento, id_settimana, dati)
        return {"IDnota": id_nuovo}
    else:
        repo.modifica_nota(esistente[0], dati)
        return {"IDnota": esistente[0]}


# ─────────────────────────────────────────
# LOOKUP TABLES
# ─────────────────────────────────────────

def get_lookup_stretching():
    return [{"IDesercizioStretching": r[0], "NomeEsercizio": r[1]} for r in repo.get_lookup_stretching()]

def get_lookup_riscaldamento():
    return [{"IDesercizioRiscaldamento": r[0], "NomeEsercizio": r[1]} for r in repo.get_lookup_riscaldamento()]

def get_lookup_distanza():
    return [{"IDdistanza": r[0], "NomeEsercizio": r[1]} for r in repo.get_lookup_distanza()]

def get_lookup_targa():
    return [{"IDtarga": r[0], "NomeTarga": r[1]} for r in repo.get_lookup_targa()]

def get_lookup_descrizione_esercizio():
    return [{"IDdescrizioneEsercizio": r[0], "NomeEsercizio": r[1]} for r in repo.get_lookup_descrizione_esercizio()]

def get_lookup_tabella_numero():
    return [{"IDtabella_n": r[0], "NumeroTabella": r[1]} for r in repo.get_lookup_tabella_numero()]

def get_lookup_desc_esercizio_all_fis_for_res():
    return [{"IDdescrizioneEsercizioAllFisForRes": r[0], "DescrizioneEsercizio": r[1]} for r in repo.get_lookup_desc_esercizio_all_fis_for_res()]

def get_lookup_attrezzi():
    return [{"IDattrezzo": r[0], "AttrezzoDes": r[1]} for r in repo.get_lookup_attrezzi()]

def get_lookup_desc_esercizio_all_fis_cor():
    return [{"IDdescrizioneEsercizioAllFisCor": r[0], "DescrizioneEsercizio": r[1]} for r in repo.get_lookup_desc_esercizio_all_fis_cor()]

def crea_seduta_se_non_esiste(id_allenamento: int, id_settimana: int, id_seduta: int):
    repo.crea_seduta_se_non_esiste(id_allenamento, id_settimana, id_seduta)