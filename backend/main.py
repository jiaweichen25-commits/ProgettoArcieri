from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os


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


# Carica le variabili d'ambiente dal file .env
load_dotenv()

app = FastAPI(title="API Arcieri Vicenza")

# Configurazione del Middleware CORS (perfetto per lo sviluppo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
    ],
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


@app.get("/")
def read_root():
    return {"message": "QUALCOSA???"}