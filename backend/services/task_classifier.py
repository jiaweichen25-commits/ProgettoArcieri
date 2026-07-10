_KEYWORDS_ANALISI = (
    "punteggio",
    "punteggi",
    "media",
    "medie",
    "trend",
    "segnapunti",
    "segnapunto",
    "volee",
    "volée",
    "freccia",
    "frecce",
    "totale",
    "confronta risultati",
    "analizza i dati",
    "analisi dati",
    "statistiche",
    "andamento",
)

_KEYWORDS_RAGIONAMENTO = (
    "strategia",
    "piano allenamento",
    "piano di allenamento",
    "proponi",
    "preparazione gara",
    "preparazione alla gara",
    "tecnica avanzata",
    "obiettivi",
    "confronta approcci",
    "ragionamento",
    "valuta le opzioni",
    "piano gara",
)


def classifica_task(
    domanda: str,
    ha_contesto_atleta: bool,
    ha_segnapunti: bool,
) -> str:
    testo = domanda.lower()

    if ha_contesto_atleta and ha_segnapunti:
        return "analisi_dati"

    if any(kw in testo for kw in _KEYWORDS_ANALISI):
        return "analisi_dati"

    if len(domanda) > 200:
        return "ragionamento_complesso"

    if any(kw in testo for kw in _KEYWORDS_RAGIONAMENTO):
        return "ragionamento_complesso"

    return "generale"
