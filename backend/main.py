from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import bcrypt
from repositories import user_repository


from dotenv import load_dotenv
from controllers import visitemed_controller
from controllers import auth_controller
from controllers import atleti_controller
from controllers import materiali_controller
from controllers import me_controller
from controllers import antidoping_controller
from controllers import allenamenti_controller
from controllers import pianogare_controller
from controllers import dettaglioallenamenti_controller
from controllers import lookup_controller
from controllers import ai_assistant_controller
from controllers import segnapunti_controller
from controllers import admin_controller


# Carica le variabili d'ambiente dal file .env
load_dotenv()

app = FastAPI(title="API Arcieri Vicenza")

# Configurazione del Middleware CORS (perfetto per lo sviluppo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #da sostituire con url
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusione dei Router/Controller delle varie entità
app.include_router(auth_controller.router)
app.include_router(atleti_controller.router)
app.include_router(materiali_controller.router)
app.include_router(me_controller.router)
app.include_router(visitemed_controller.router)
app.include_router(antidoping_controller.router)
app.include_router(allenamenti_controller.router)
app.include_router(pianogare_controller.router)
app.include_router(dettaglioallenamenti_controller.router)
app.include_router(lookup_controller.router)
app.include_router(ai_assistant_controller.router)
app.include_router(segnapunti_controller.router)
app.include_router(admin_controller.router)


@app.on_event("startup")
def startup_event():
    admin_email = "admin@amministratore.it"
    try:
        user = user_repository.get_user_by_email(admin_email)
        if not user:
            # Crea l'admin di default
            hashed = bcrypt.hashpw("admin".encode(), bcrypt.gensalt()).decode()
            user_repository.create_user(admin_email, hashed, "admin", must_change_password=True)
            print(f"Utente admin '{admin_email}' creato con successo.")
    except Exception as e:
        print(f"Errore durante l'inizializzazione dell'admin: {e}")

@app.get("/")
def read_root():
    return {"message": "QUALCOSA???"}