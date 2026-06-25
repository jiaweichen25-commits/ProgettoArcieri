from fastapi import HTTPException, status
from repositories import atleti_repository, materiali_repository, allenamenti_repository, visitemed_repository, antidoping_repository
from repositories import me_repository
from services.materiali_service import _row_to_dict as _materiale_row_to_dict
from services.allenamenti_service import _row_to_dict as _allenamento_row_to_dict
from services.visitemed_service import _row_to_dict as _visita_row_to_dict
from services.antidoping_service import _row_to_dict as _antidoping_row_to_dict
from repositories import pianogare_repository

def _atleta_row_to_dict(row) -> dict:
    return {
        "IDatleta":      row[0],
        "nome":          row[1],
        "cognome":       row[2],
        "codice_fiscale": row[3],
        "data_nascita":  row[4],
        "telefono":      row[5],
        "cellulare":     row[6],
        "email":         row[7],
        "indirizzo":     row[8],
        "cap":           str(row[9]) if row[9] is not None else None,
        "citta":         row[10],
    }

def _get_atleta_or_404(id_utente: int) -> dict:
    row = atleti_repository.get_atleta_by_id_utente(id_utente)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo atleta non trovato"
        )
    return _atleta_row_to_dict(row)

def get_profilo(id_utente: int):
    return _get_atleta_or_404(id_utente)

def get_materiali(id_utente: int):
    atleta = _get_atleta_or_404(id_utente)
    rows = materiali_repository.get_materiali_by_atleta(atleta["IDatleta"])
    return [_materiale_row_to_dict(row) for row in rows]

def get_allenamenti(id_utente: int):
    atleta = _get_atleta_or_404(id_utente)
    rows = allenamenti_repository.get_allenamenti_by_atleta(atleta["IDatleta"])
    return [_allenamento_row_to_dict(row) for row in rows]

def get_visite(id_utente: int):
    atleta = _get_atleta_or_404(id_utente)
    rows = visitemed_repository.get_visite_by_atleta(atleta["IDatleta"])
    return [_visita_row_to_dict(row) for row in rows]

def get_antidoping(id_utente: int):
    atleta = _get_atleta_or_404(id_utente)
    rows = antidoping_repository.get_antidoping_by_atleta(atleta["IDatleta"])
    return [_antidoping_row_to_dict(row) for row in rows]

def get_piano_gare(id_utente: int):
    atleta = _get_atleta_or_404(id_utente)
    # Prende tutti gli allenamenti dell'atleta
    rows_all = allenamenti_repository.get_allenamenti_by_atleta(atleta["IDatleta"])
    # Per ogni allenamento prende le gare visibili
    gare = []
    for row in rows_all:
        id_allenamento = row[0]
        rows_gare = pianogare_repository.get_gare_by_allenamento(id_allenamento)
        for g in rows_gare:
            if not g[8]:  # EscludiVisualizzazione = False
                gare.append({
                    "IDpianogara":   g[0],
                    "IDallenamento": g[1],
                    "id_tipogara":   g[2],
                    "tipo_gara":     g[3],
                    "data":          g[4],
                    "luogo":         g[5],
                    "distanza":      g[6],
                    "note":          g[7],
                    "escludi_visualizzazione": g[8],
                })
    gare.sort(key=lambda x: (x["data"] is None, x["data"]))
    return gare