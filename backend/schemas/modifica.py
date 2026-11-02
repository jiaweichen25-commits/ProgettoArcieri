from pydantic import BaseModel, model_validator


class ModificaCompleta(BaseModel):
    """Base per gli schemi delle modifiche (PUT): ogni campo dello schema deve essere nel JSON.

    Senza, un campo non inviato varrebbe None (il suo default) e la UPDATE lo svuoterebbe nel database.
    Un campo si puo' ancora svuotare apposta mandandolo con valore null.
    """

    @model_validator(mode="before")
    @classmethod
    def tutti_i_campi(cls, dati):
        # mode="before": gira sul JSON cosi' com'e' arrivato, prima che Pydantic metta i default
        if isinstance(dati, dict):
            mancanti = [nome for nome in cls.model_fields if nome not in dati]
            if mancanti:
                # ValueError in un validatore -> FastAPI risponde 422 con questo messaggio
                raise ValueError(f"Campi mancanti: {', '.join(mancanti)}")
        return dati
