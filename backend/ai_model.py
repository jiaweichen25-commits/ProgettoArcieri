from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from config.database import Base  # Adjust this import based on your existing database configuration file

class TcronologiaCoachAI(Base):
    """
    SQLAlchemy model for the 'TcronologiaCoachAI' table.
    Gestisce il salvataggio a lungo termine dello storico delle chat con l'AI.
    """
    __tablename__ = "TcronologiaCoachAI"
    __table_args__ = {"schema": "public"}

    # Table columns definitions aligned with the PostgreSQL database structure
    IDconversazione = Column(Integer, primary_key=True, index=True, autoincrement=True)
    IDatleta = Column(Integer, ForeignKey("public.Tatleti.IDatleta", ondelete="CASCADE"), nullable=False)
    RuoloUtente = Column(String, nullable=False)     # Saves 'istruttore' or 'atleta'
    Domanda = Column(Text, nullable=False)
    RispostaAI = Column(Text, nullable=False)
    DataOra = Column(DateTime, server_default=func.now())  # Automatically sets the current date and time
