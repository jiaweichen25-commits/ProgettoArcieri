from fastapi import HTTPException, status
from repositories import materiali_repository, atleti_repository

def _get_istruttore_or_404(id_utente: int) -> int:
    id_istruttore = atleti_repository.get_id_istruttore_by_utente(id_utente)
    if not id_istruttore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo istruttore non trovato"
        )
    return id_istruttore

def _verifica_atleta(id_atleta: int, id_istruttore: int):
    atleti = atleti_repository.get_atleti_by_istruttore(id_istruttore)
    ids = {row[0] for row in atleti}
    if id_atleta not in ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atleta non trovato o non appartiene a questo istruttore"
        )

def _row_to_dict(row) -> dict:
    return {
        "IDmateriale": row[0],
        "IDatleta": row[1],
        "riser": row[2],
        "lunghezza_riser": row[3],
        "flettenti": row[4],
        "lunghezza_flettenti": row[5],
        "potenza_nominale": row[6],
        "rest": row[7],
        "mirino": row[8],
        "stabilizzazione": row[9],
        "aste": row[10],
        "lunghezza_aste": row[11],
        "punte": row[12],
        "peso_punte": row[13],
        "cocche": row[14],
        "alette": row[15],
        "lunghezza_alette": row[16],
        "spine": row[17],
        "corda": row[18],
        "fili": row[19],
        "patella": row[20],
        "bottone": row[21],
        "molla": row[22],
        "tiller_superiore": row[23],
        "tiller_inferiore": row[24],
        "brace": row[25],
        "allungo": row[26],
        "potenza_reale": row[27],
        "punto_incocco": row[28],
        "data": row[29],
        "materiale_corrente": row[30],
    }

def get_materiali(id_utente: int, id_atleta: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)
    rows = materiali_repository.get_materiali_by_atleta(id_atleta)
    return [_row_to_dict(row) for row in rows]

def crea_materiale(id_utente: int, id_atleta: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)

    if dati.get("materiale_corrente"):
        materiali_repository.reset_materiale_corrente(id_atleta)

    new_id = materiali_repository.crea_materiale(id_atleta, dati)
    return {"IDmateriale": new_id, "message": "Materiale creato con successo"}

def modifica_materiale(id_utente: int, id_atleta: int, id_materiale: int, dati: dict):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)

    existing = materiali_repository.get_materiale_by_id(id_materiale, id_atleta)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Materiale non trovato"
        )

    if dati.get("materiale_corrente"):
        materiali_repository.reset_materiale_corrente(id_atleta, escluso_id=id_materiale)

    ok = materiali_repository.modifica_materiale(id_materiale, id_atleta, dati)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Materiale non trovato"
        )
    return {"message": "Materiale aggiornato con successo"}

def elimina_materiale(id_utente: int, id_atleta: int, id_materiale: int):
    id_istruttore = _get_istruttore_or_404(id_utente)
    _verifica_atleta(id_atleta, id_istruttore)

    ok = materiali_repository.elimina_materiale(id_materiale, id_atleta)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Materiale non trovato"
        )
    return {"message": "Materiale eliminato con successo"}
