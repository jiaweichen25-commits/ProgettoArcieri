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

@app.get("/")
def read_root():
    return {"message": "QUALCOSA???"}