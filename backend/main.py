from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from config.limiter import limiter, rate_limit_handler
from config.settings import DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, CORS_ORIGINS
import os
import bcrypt
from repositories import user_repository
from services.segreti import genera_password_temporanea



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
from controllers import me_segnapunti_controller




app = FastAPI(title="API Arcieri Vicenza")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# CORS solo per le origini elencate in CORS_ORIGINS (vedi config/settings.py).
# Niente allow_credentials: il token viaggia nell'header Authorization, non nei cookie.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Retry-After"],
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
app.include_router(me_segnapunti_controller.router)


@app.on_event("startup")
def startup_event():
    try:
        user = user_repository.get_user_by_email(DEFAULT_ADMIN_EMAIL)
        if not user:
            password = DEFAULT_ADMIN_PASSWORD or genera_password_temporanea()
            hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            user_repository.create_user(DEFAULT_ADMIN_EMAIL, hashed, "admin", must_change_password=True)
            print(f"Utente admin '{DEFAULT_ADMIN_EMAIL}' creato con successo.")
            if DEFAULT_ADMIN_PASSWORD:
                print("[ADMIN] password provvisoria: quella di DEFAULT_ADMIN_PASSWORD")
            else:
                # flush: in Docker l'output non e' un terminale e senza flush la riga resterebbe nel buffer.
                print(f"[ADMIN] password provvisoria: {password} (da cambiare al primo accesso)", flush=True)
    except Exception as e:
        print(f"Errore durante l'inizializzazione dell'admin: {e}")

@app.get("/")
def read_root():
    return {"message": "QUALCOSA???"}

# ── Serving statico del frontend (comodo per lo sviluppo locale) ──
# In produzione (Docker) il frontend è servito da nginx nel suo container,
# quindi questo mount viene semplicemente ignorato.
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(frontend_dir):
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")