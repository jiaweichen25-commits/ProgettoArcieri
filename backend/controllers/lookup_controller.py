from fastapi import APIRouter, HTTPException, Response, status, Depends
from pydantic import BaseModel
from repositories import lookup_repository as repo
from dependencies.auth_deps import solo_istruttore

router = APIRouter(prefix="/allenamenti/lookup", tags=["lookup"])


class LookupItemIn(BaseModel):
    valore: str


def _items(rows):
    return [{"id": r[0], "valore": r[1]} for r in rows]


# ═══════════════════════════════════════════════════════════════
# TFR
# ═══════════════════════════════════════════════════════════════

@router.get('/tfr/exercises/')
def get_tfr_exercises():
    return _items(repo.get_tfr_exercises())

@router.post('/tfr/exercises/', status_code=status.HTTP_201_CREATED)
def add_tfr_exercise(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_tfr_exercise(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/tfr/exercises/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_tfr_exercise(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_tfr_exercise(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/tfr/tempi/')
def get_tfr_tempi():
    return _items(repo.get_tfr_tempi())

@router.post('/tfr/tempi/', status_code=status.HTTP_201_CREATED)
def add_tfr_tempo(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_tfr_tempo(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/tfr/tempi/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_tfr_tempo(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_tfr_tempo(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/tfr/ripetizioni/')
def get_tfr_ripetizioni():
    return _items(repo.get_tfr_ripetizioni())

@router.post('/tfr/ripetizioni/', status_code=status.HTTP_201_CREATED)
def add_tfr_ripetizione(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_tfr_ripetizione(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/tfr/ripetizioni/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_tfr_ripetizione(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_tfr_ripetizione(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════
# FC
# ═══════════════════════════════════════════════════════════════

@router.get('/fc/atrezzi/')
def get_fc_atrezzi():
    return _items(repo.get_fc_atrezzi())

@router.post('/fc/atrezzi/', status_code=status.HTTP_201_CREATED)
def add_fc_atrezzo(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_fc_atrezzo(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/fc/atrezzi/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_fc_atrezzo(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_fc_atrezzo(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/fc/tempi/')
def get_fc_tempi():
    return _items(repo.get_fc_tempi())

@router.post('/fc/tempi/', status_code=status.HTTP_201_CREATED)
def add_fc_tempo(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_fc_tempo(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/fc/tempi/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_fc_tempo(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_fc_tempo(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/fc/descrizione/')
def get_fc_descrizione():
    return _items(repo.get_fc_descrizione())

@router.post('/fc/descrizione/', status_code=status.HTTP_201_CREATED)
def add_fc_descrizione(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_fc_descrizione(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/fc/descrizione/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_fc_descrizione(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_fc_descrizione(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════
# TFC
# ═══════════════════════════════════════════════════════════════

@router.get('/tfc/piedi/')
def get_tfc_piedi():
    return _items(repo.get_tfc_piedi())

@router.post('/tfc/piedi/', status_code=status.HTTP_201_CREATED)
def add_tfc_piede(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_tfc_piede(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/tfc/piedi/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_tfc_piede(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_tfc_piede(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/tfc/distanza/')
def get_tfc_distanza():
    return _items(repo.get_tfc_distanza())

@router.post('/tfc/distanza/', status_code=status.HTTP_201_CREATED)
def add_tfc_distanza(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_tfc_distanza(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/tfc/distanza/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_tfc_distanza(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_tfc_distanza(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/tfc/targa/')
def get_tfc_targa():
    return _items(repo.get_tfc_targa())

@router.post('/tfc/targa/', status_code=status.HTTP_201_CREATED)
def add_tfc_targa(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_tfc_targa(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/tfc/targa/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_tfc_targa(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_tfc_targa(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/tfc/serie/')
def get_tfc_serie():
    return _items(repo.get_tfc_serie())

@router.post('/tfc/serie/', status_code=status.HTTP_201_CREATED)
def add_tfc_serie(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_tfc_serie(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/tfc/serie/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_tfc_serie(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_tfc_serie(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/tfc/descrizione/')
def get_tfc_descrizione():
    return _items(repo.get_tfc_descrizione())

@router.post('/tfc/descrizione/', status_code=status.HTTP_201_CREATED)
def add_tfc_descrizione(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_tfc_descrizione(item.valore)
    return {"id": new_id, "valore": item.valore}

@router.delete('/tfc/descrizione/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_tfc_descrizione(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_tfc_descrizione(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════
# Riscaldamento / Stretching
# ═══════════════════════════════════════════════════════════════

@router.get('/riscaldamento/')
def get_riscaldamento():
    rows = repo.get_riscaldamento()
    return [{"IDesercizioRiscaldamento": r[0], "NomeEsercizio": r[1]} for r in rows]

@router.get('/riscaldamento-list/')
def get_riscaldamento_list():
    rows = repo.get_riscaldamento()
    return [{"IDesercizioRiscaldamento": r[0], "NomeEsercizio": r[1]} for r in rows]

@router.post('/riscaldamento/', status_code=status.HTTP_201_CREATED)
def add_riscaldamento(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_riscaldamento(item.valore)
    return {"IDesercizioRiscaldamento": new_id, "NomeEsercizio": item.valore}

@router.delete('/riscaldamento/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_riscaldamento(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_riscaldamento(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/stretching/')
def get_stretching():
    rows = repo.get_stretching()
    return [{"IDesercizioStretching": r[0], "NomeEsercizio": r[1]} for r in rows]

@router.get('/stretching-list/')
def get_stretching_list():
    rows = repo.get_stretching()
    return [{"IDesercizioStretching": r[0], "NomeEsercizio": r[1]} for r in rows]

@router.post('/stretching/', status_code=status.HTTP_201_CREATED)
def add_stretching(item: LookupItemIn, _=Depends(solo_istruttore)):
    new_id = repo.add_stretching(item.valore)
    return {"IDesercizioStretching": new_id, "NomeEsercizio": item.valore}

@router.delete('/stretching/{id}', status_code=status.HTTP_204_NO_CONTENT)
def del_stretching(id: int, _=Depends(solo_istruttore)):
    if not repo.delete_stretching(id):
        raise HTTPException(status_code=404, detail="Non trovato")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════
# Alias backward-compat per DettaglioAllenamento.js
# ═══════════════════════════════════════════════════════════════

@router.get('/distanza/')
def alias_distanza():
    rows = repo.get_tfc_distanza()
    return [{"IDdistanza": r[0], "NomeEsercizio": r[1]} for r in rows]

@router.get('/distanza-list/')
def alias_distanza_list():
    rows = repo.get_tfc_distanza()
    return [{"IDdistanza": r[0], "NomeEsercizio": r[1]} for r in rows]

@router.get('/targa/')
def alias_targa():
    rows = repo.get_tfc_targa()
    return [{"IDtarga": r[0], "NomeTarga": r[1]} for r in rows]

@router.get('/targa-list/')
def alias_targa_list():
    rows = repo.get_tfc_targa()
    return [{"IDtarga": r[0], "NomeTarga": r[1]} for r in rows]

@router.get('/descrizione-esercizio/')
def alias_descrizione_esercizio():
    rows = repo.get_tfc_descrizione()
    return [{"IDdescrizioneEsercizio": r[0], "NomeEsercizio": r[1]} for r in rows]

@router.get('/descrizione-esercizio-list/')
def alias_descrizione_esercizio_list():
    rows = repo.get_tfc_descrizione()
    return [{"IDdescrizioneEsercizio": r[0], "NomeEsercizio": r[1]} for r in rows]

@router.get('/tabella-numero/')
def alias_tabella_numero():
    rows = repo.get_tfc_serie()
    return [{"IDtabella_n": r[0], "NumeroTabella": r[1]} for r in rows]

@router.get('/tabella-numero-list/')
def alias_tabella_numero_list():
    rows = repo.get_tfc_serie()
    return [{"IDtabella_n": r[0], "NumeroTabella": r[1]} for r in rows]

@router.get('/allfisforres-descrizione/')
def alias_allfisforres_descrizione():
    rows = repo.get_fc_descrizione()
    return [{"IDdescrizioneEsercizioAllFisCor": r[0], "DescrizioneEsercizio": r[1]} for r in rows]

@router.get('/allfisforres-descrizione-list/')
def alias_allfisforres_descrizione_list():
    rows = repo.get_fc_descrizione()
    return [{"IDdescrizioneEsercizioAllFisCor": r[0], "DescrizioneEsercizio": r[1]} for r in rows]

@router.get('/attrezzi/')
def alias_attrezzi():
    rows = repo.get_fc_atrezzi()
    return [{"IDattrezzo": r[0], "AttrezzoDes": r[1]} for r in rows]

@router.get('/attrezzi-list/')
def alias_attrezzi_list():
    rows = repo.get_fc_atrezzi()
    return [{"IDattrezzo": r[0], "AttrezzoDes": r[1]} for r in rows]

@router.get('/allfiscor-descrizione/')
def alias_allfiscor_descrizione():
    rows = repo.get_fc_descrizione()
    return [{"IDdescrizioneEsercizioAllFisCor": r[0], "DescrizioneEsercizio": r[1]} for r in rows]

@router.get('/allfiscor-descrizione-list/')
def alias_allfiscor_descrizione_list():
    rows = repo.get_fc_descrizione()
    return [{"IDdescrizioneEsercizioAllFisCor": r[0], "DescrizioneEsercizio": r[1]} for r in rows]
