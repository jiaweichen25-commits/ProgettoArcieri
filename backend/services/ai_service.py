import os
from groq import Groq
from repositories import ai_repository

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

SYSTEM_PROMPT = """Sei un analista biomeccanico senior ed allenatore federale di tiro con l'arco (Fitarco/WA).
Il tuo compito è esaminare i dati reali dell'atleta estratti dal database e fornire:
- Analisi tecniche dettagliate dei pattern di tiro
- Diagnosi biomeccaniche posturali
- Raccomandazioni di tuning dell'attrezzatura (spine aste, bottone Berger, clicker, brace height)
- Piani di allenamento e progressione

REGOLE FONDAMENTALI:
- Rispondi SEMPRE in italiano con terminologia tecnica arcieristica precisa (Fitarco/WA).
- Usa termini come: clicker, ancoraggio, bottone Berger, stabilità della spalla, spina dell'asta, tuning, brace height, nocking point, paradox dell'arciere, draw length, draw weight.
- Struttura le risposte con paragrafi chiari e punti elenco per le raccomandazioni.
- Basa le analisi SOLO sui dati reali dell'atleta forniti nel contesto. Non inventare dati.
- Se i dati sono insufficienti per una diagnosi certa, dichiara esplicitamente quali informazioni mancano.
- Sii preciso, professionale e tecnico — parla come un coach federale esperto."""


def _build_context(dati: dict) -> str:
    lines = []

    p = dati.get("profilo")
    if p:
        lines.append(f"PROFILO ATLETA: {p[0]} {p[1]} | Nascita: {p[2]} | Città: {p[3]}")

    m = dati.get("materiale")
    if m:
        lines.append("\nATTREZZATURA CORRENTE:")
        lines.append(f"  Riser: {m[0]} ({m[1]})")
        lines.append(f"  Flettenti: {m[2]} ({m[3]})")
        lines.append(f"  Potenza nominale: {m[4]} lbs | Potenza reale: {m[5]} lbs")
        lines.append(f"  Allungo: {m[6]} pollici")
        lines.append(f"  Mirino: {m[7]} | Stabilizzazione: {m[8]}")
        lines.append(f"  Corda: {m[9]} | Fili: {m[10]}")
        lines.append(f"  Punte: {m[11]} ({m[12]}g) | Spine: {m[15]}")
        lines.append(f"  Cocche: {m[13]} | Alette: {m[14]}")
        lines.append(f"  Brace Height: {m[16]} | Tiller sup: {m[17]} | Tiller inf: {m[18]}")
        lines.append(f"  Bottone: {m[19]} | Molla: {m[20]} | Punto incocco: {m[21]}")
        lines.append(f"  Data rilevamento: {m[22]}")

    allenamenti = dati.get("allenamenti", [])
    if allenamenti:
        lines.append("\nSTORICO ALLENAMENTI (ultimi 5):")
        for a in allenamenti:
            lines.append(f"  [{a[0]} → {a[1]}] Obiettivi: {a[2] or 'non specificati'}")

    visite = dati.get("visite", [])
    if visite:
        lines.append("\nVISITE MEDICHE:")
        for v in visite:
            lines.append(f"  Visita: {v[0]} | Scadenza: {v[1]}")

    antidoping = dati.get("antidoping", [])
    if antidoping:
        lines.append("\nANTIDOPING:")
        for a in antidoping:
            stato = "Autorizzato" if a[1] else "Non autorizzato"
            lines.append(f"  Anno {a[0]}: {stato} | Scadenza: {a[2]}")

    gare = dati.get("gare", [])
    if gare:
        lines.append("\nPIANO GARE:")
        for g in gare:
            lines.append(f"  [{g[0]}] {g[4] or 'N/D'} | {g[1]} | {g[2]} | Note: {g[3] or '-'}")

    return "\n".join(lines)


def chiedi_ai_atleta(id_utente: int, domanda: str) -> str:
    """Versione per l'atleta loggato — ricava IDatleta dall'utente."""
    id_atleta = ai_repository.get_id_atleta_by_utente(id_utente)
    if not id_atleta:
        raise ValueError("Profilo atleta non trovato")
    return chiedi_ai(id_atleta, domanda, ruolo='atleta')


def chiedi_ai(id_atleta: int, domanda: str, ruolo: str = 'istruttore') -> str:
    contesto = ai_repository.get_contesto_atleta(id_atleta)
    ctx_str = _build_context(contesto)

    # Usa tutta la cronologia (istruttore + atleta) come contesto per l'AI
    storia = ai_repository.get_cronologia(id_atleta)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in storia[-6:]:
        messages.append({"role": "user", "content": h["Domanda"]})
        messages.append({"role": "assistant", "content": h["RispostaAI"]})

    messages.append({
        "role": "user",
        "content": f"=== DATI REALI ATLETA DAL DATABASE ===\n{ctx_str}\n\n=== DOMANDA ===\n{domanda}"
    })

    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=2048,
    )

    risposta = response.choices[0].message.content
    ai_repository.salva_cronologia(id_atleta, domanda, risposta, ruolo=ruolo)
    return risposta
