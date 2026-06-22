from repositories import lookup_repository as repo


# ─────────────────────────────────────────
# Lookup tables — letture
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


# ─────────────────────────────────────────
# Lookup tables — create / delete
# ─────────────────────────────────────────

def crea_lookup_stretching(nome: str):
    r = repo.crea_lookup_stretching(nome)
    return {"IDesercizioStretching": r[0], "NomeEsercizio": r[1]}

def elimina_lookup_stretching(id_: int):
    return repo.elimina_lookup_stretching(id_)

def crea_lookup_riscaldamento(nome: str):
    r = repo.crea_lookup_riscaldamento(nome)
    return {"IDesercizioRiscaldamento": r[0], "NomeEsercizio": r[1]}

def elimina_lookup_riscaldamento(id_: int):
    return repo.elimina_lookup_riscaldamento(id_)

def crea_lookup_distanza(nome: str):
    r = repo.crea_lookup_distanza(nome)
    return {"IDdistanza": r[0], "NomeEsercizio": r[1]}

def elimina_lookup_distanza(id_: int):
    return repo.elimina_lookup_distanza(id_)

def crea_lookup_targa(nome: str):
    r = repo.crea_lookup_targa(nome)
    return {"IDtarga": r[0], "NomeTarga": r[1]}

def elimina_lookup_targa(id_: int):
    return repo.elimina_lookup_targa(id_)

def crea_lookup_descrizione_esercizio(nome: str):
    r = repo.crea_lookup_descrizione_esercizio(nome)
    return {"IDdescrizioneEsercizio": r[0], "NomeEsercizio": r[1]}

def elimina_lookup_descrizione_esercizio(id_: int):
    return repo.elimina_lookup_descrizione_esercizio(id_)

def crea_lookup_tabella_numero(numero: int):
    r = repo.crea_lookup_tabella_numero(numero)
    return {"IDtabella_n": r[0], "NumeroTabella": r[1]}

def elimina_lookup_tabella_numero(id_: int):
    return repo.elimina_lookup_tabella_numero(id_)

def crea_lookup_desc_esercizio_all_fis_for_res(nome: str):
    r = repo.crea_lookup_desc_esercizio_all_fis_for_res(nome)
    return {"IDdescrizioneEsercizioAllFisForRes": r[0], "DescrizioneEsercizio": r[1]}

def elimina_lookup_desc_esercizio_all_fis_for_res(id_: int):
    return repo.elimina_lookup_desc_esercizio_all_fis_for_res(id_)

def crea_lookup_attrezzi(nome: str):
    r = repo.crea_lookup_attrezzi(nome)
    return {"IDattrezzo": r[0], "AttrezzoDes": r[1]}

def elimina_lookup_attrezzi(id_: int):
    return repo.elimina_lookup_attrezzi(id_)

def crea_lookup_desc_esercizio_all_fis_cor(nome: str):
    r = repo.crea_lookup_desc_esercizio_all_fis_cor(nome)
    return {"IDdescrizioneEsercizioAllFisCor": r[0], "DescrizioneEsercizio": r[1]}

def elimina_lookup_desc_esercizio_all_fis_cor(id_: int):
    return repo.elimina_lookup_desc_esercizio_all_fis_cor(id_)