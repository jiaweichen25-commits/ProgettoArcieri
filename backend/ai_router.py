import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google import genai
from schemas.ai_schema import RichiestaMessaggioAI, RispostaMessaggioAI
from models.ai_model import TcronologiaCoachAI
from config.database import get_db  # Adjust this import based on your database session file

router = APIRouter(
    prefix="/ai",
    tags=["Coach Artificial Intelligence"]
)

# Your real Gemini API key is securely placed as the default fallback variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

@router.post("/chiedi", response_model=RispostaMessaggioAI)
async def chiedi_e_salva_ai(payload: RichiestaMessaggioAI, db: Session = Depends(get_db)):
    """
    Endpoint that processes the archery technical query and saves the history.
    Riceve la domanda, interroga Gemini e salva lo storico su PostgreSQL.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "":
        raise HTTPException(status_code=500, detail="Gemini API Key is missing or empty in the backend.")

    # Fetching real athlete details from database to provide as a context to the AI
    # This enables personalized coaching advice based on the profile
    try:
        from models.atleti_model import Tatleti  # Adjust this import based on your real athlete model filename
        atleta = db.query(Tatleti).filter(Tatleti.IDatleta == payload.IDatleta).first()
    except Exception:
        atleta = None

    contesto = "Sei un Coach AI di tiro con l'arco Fitarco. Rispondi in italiano con punti elenco tecnici.\n"
    if atleta:
        contesto += f"Stai analizzando l'atleta: {atleta.Nome} {atleta.Cognome}.\n"
        contesto += f"Città: {atleta.CITTA}. Codice Fiscale: {atleta.Codice_Fiscale}.\n"

    try:
        # Initialize Google GenAI client and request content generation
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"{contesto}Richiesta inviata da: {payload.RuoloUtente}.\nDomanda: {payload.Domanda}"
        )
        risposta_testo = response.text

        # Saving the new chat message log directly into PgAdmin table
        nuovo_messaggio = TcronologiaCoachAI(
            IDatleta=payload.IDatleta,
            RuoloUtente=payload.RuoloUtente,
            Domanda=payload.Domanda,
            RispostaAI=risposta_testo
        )
        db.add(nuovo_messaggio)
        db.commit()
        db.refresh(nuovo_messaggio)
        return nuovo_messaggio

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore del server AI: {str(e)}")

@router.get("/cronologia/{id_atleta}", response_model=list[RispostaMessaggioAI])
async def ottieni_cronologia(id_atleta: int, db: Session = Depends(get_db)):
    """
    Retrieves the long-term historical chat logs from PostgreSQL database for the client side.
    Recupera lo storico delle bisede dal database per mostrarlo nel frontend.
    """
    return db.query(TcronologiaCoachAI).filter(TcronologiaCoachAI.IDatleta == id_atleta).order_by(TcronologiaCoachAI.DataOra.desc()).all()
