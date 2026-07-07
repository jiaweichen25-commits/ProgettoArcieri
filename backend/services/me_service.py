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

def get_dettaglio_allenamento(id_utente: int, id_allenamento: int):
    # Verify the allenamento belongs to the atleta
    atleta = _get_atleta_or_404(id_utente)
    allenamenti_atleta = allenamenti_repository.get_allenamenti_by_atleta(atleta["IDatleta"])
    if not any(a[0] == id_allenamento for a in allenamenti_atleta):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allenamento non trovato o non autorizzato")

    # Get sedute
    sedute_rows = me_repository.get_sedute_by_allenamento(id_allenamento)
    
    # Structure the response
    # We want to group by settimana, then by seduta
    dettaglio = {}
    
    for row in sedute_rows:
        id_settimana = row[1]
        id_seduta = row[2]
        
        if id_settimana not in dettaglio:
            nota_row = me_repository.get_nota_allenamento(id_allenamento, id_settimana)
            dettaglio[id_settimana] = {
                "id_settimana": id_settimana,
                "nota": nota_row[1] if nota_row else None,
                "nota_atleta": nota_row[2] if nota_row else None,
                "sedute": []
            }
            
        seduta_dict = {
            "id_seduta": id_seduta,
            "stretching": [],
            "riscaldamento": [],
            "tec_for_cor": [],
            "all_fis_for_res": [],
            "all_fis_cor": []
        }
        
        # Stretching
        stretch_rows = me_repository.get_stretching_con_nomi(id_allenamento, id_settimana, id_seduta)
        for sr in stretch_rows:
            seduta_dict["stretching"].append({
                "id": sr[0], "nome": sr[1], "giorni": {"lun": sr[2], "mar": sr[3], "mer": sr[4], "gio": sr[5], "ven": sr[6], "sab": sr[7], "dom": sr[8]}
            })
            
        # Riscaldamento
        risc_rows = me_repository.get_riscaldamento_con_nomi(id_allenamento, id_settimana, id_seduta)
        for rr in risc_rows:
            seduta_dict["riscaldamento"].append({
                "id": rr[0], "nome": rr[1], "giorni": {"lun": rr[2], "mar": rr[3], "mer": rr[4], "gio": rr[5], "ven": rr[6], "sab": rr[7], "dom": rr[8]}
            })
            
        # TecForCor
        tfc_rows = me_repository.get_tec_for_cor_con_nomi(id_allenamento, id_settimana, id_seduta)
        for tr in tfc_rows:
            seduta_dict["tec_for_cor"].append({
                "id": tr[0], "posizione_piedi": tr[1], "distanza": tr[2], "targa": tr[3], "esercizio": tr[4],
                "giorni": {"lun": tr[5], "mar": tr[6], "mer": tr[7], "gio": tr[8], "ven": tr[9], "sab": tr[10], "dom": tr[11]}
            })
            
        # AllFisForRes
        affr_rows = me_repository.get_all_fis_for_res_con_nomi(id_allenamento, id_settimana, id_seduta)
        for ar in affr_rows:
            seduta_dict["all_fis_for_res"].append({
                "id": ar[0], "tabella_n": ar[1], "esercizio": ar[2],
                "giorni": {"lun": ar[3], "mar": ar[4], "mer": ar[5], "gio": ar[6], "ven": ar[7], "sab": ar[8], "dom": ar[9]}
            })
            
        # AllFisCor
        afc_rows = me_repository.get_all_fis_cor_con_nomi(id_allenamento, id_settimana, id_seduta)
        for cr in afc_rows:
            seduta_dict["all_fis_cor"].append({
                "id": cr[0], "attrezzo": cr[1], "esercizio": cr[2],
                "giorni": {"lun": cr[3], "mar": cr[4], "mer": cr[5], "gio": cr[6], "ven": cr[7], "sab": cr[8], "dom": cr[9]}
            })
            
        dettaglio[id_settimana]["sedute"].append(seduta_dict)
        
    return {"dettaglio": list(dettaglio.values())}

def salva_nota_atleta(id_utente: int, id_allenamento: int, id_settimana: int, testo: str):
    # Verify the allenamento belongs to the atleta
    atleta = _get_atleta_or_404(id_utente)
    allenamenti_atleta = allenamenti_repository.get_allenamenti_by_atleta(atleta["IDatleta"])
    if not any(a[0] == id_allenamento for a in allenamenti_atleta):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allenamento non trovato o non autorizzato")

    return me_repository.salva_nota_atleta(id_allenamento, id_settimana, testo)