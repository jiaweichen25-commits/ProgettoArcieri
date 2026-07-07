from fastapi import HTTPException, status
from repositories import segnapunti_repository, atleti_repository


def _verifica_atleta(id_utente: int, id_atleta: int):
    id_istruttore = atleti_repository.get_id_istruttore_by_utente(id_utente)
    if not id_istruttore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo istruttore non trovato"
        )
    atleti = atleti_repository.get_atleti_by_istruttore(id_istruttore)
    ids = {a[0] for a in atleti}
    if id_atleta not in ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atleta non trovato o non appartiene a questo istruttore"
        )


def _row_to_dict(r):
    return {
        "IDsegnapunto":    r[0],
        "IDatleta":        r[1],
        "data":            r[2],
        "distanza":        r[3],
        "frecce_per_volee": r[4],
        "note_istruttore": r[5],
        "note_atleta":     r[6],
        "ImpattiBersaglio": r[7],
    }


def _volee_row_to_dict(r):
    return {
        "IDvolee":      r[0],
        "IDsegnapunto": r[1],
        "mezza":        r[2],
        "numero":       r[3],
        "f1": r[4], "f2": r[5], "f3": r[6],
        "f4": r[7], "f5": r[8], "f6": r[9],
        "somma":  r[10],
        "totale": r[11],
    }


def get_segnapunti(id_utente: int, id_atleta: int):
    _verifica_atleta(id_utente, id_atleta)
    rows = segnapunti_repository.get_segnapunti(id_atleta)
    return [_row_to_dict(r) for r in rows]


def get_segnapunto(id_utente: int, id_atleta: int, id_segnapunto: int):
    _verifica_atleta(id_utente, id_atleta)
    r = segnapunti_repository.get_segnapunto(id_segnapunto)
    if r is None or r[1] != id_atleta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segnapunto non trovato"
        )
    return _row_to_dict(r)


def crea_segnapunto(id_utente: int, id_atleta: int, dati: dict):
    _verifica_atleta(id_utente, id_atleta)
    new_id = segnapunti_repository.crea_segnapunto(id_atleta, dati)
    return {"IDsegnapunto": new_id, "message": "Segnapunto creato"}


def aggiorna_segnapunto(id_utente: int, id_atleta: int, id_segnapunto: int, dati: dict):
    _verifica_atleta(id_utente, id_atleta)
    ok = segnapunti_repository.aggiorna_segnapunto(id_segnapunto, id_atleta, dati)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segnapunto non trovato"
        )
    return {"message": "Segnapunto aggiornato"}


def elimina_segnapunto(id_utente: int, id_atleta: int, id_segnapunto: int):
    _verifica_atleta(id_utente, id_atleta)
    ok = segnapunti_repository.elimina_segnapunto(id_segnapunto, id_atleta)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segnapunto non trovato"
        )


def get_volee(id_utente: int, id_atleta: int, id_segnapunto: int):
    get_segnapunto(id_utente, id_atleta, id_segnapunto)
    rows = segnapunti_repository.get_volee(id_segnapunto)
    return [_volee_row_to_dict(r) for r in rows]


def salva_volee(id_utente: int, id_atleta: int, id_segnapunto: int, volee: list):
    get_segnapunto(id_utente, id_atleta, id_segnapunto)
    segnapunti_repository.salva_volee(id_segnapunto, volee)
    return {"message": "Volée salvate"}