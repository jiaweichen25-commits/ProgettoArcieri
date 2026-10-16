import os
from dotenv import load_dotenv
from pathlib import Path

# In locale carica il .env dalla root del progetto.
# In produzione (Docker) le variabili arrivano da docker-compose.yml — questa riga non fa nulla.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

# ── JWT ──
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY non configurata! Impostala nel file .env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

# ── Database ──
DATABASE_URL = os.getenv("DATABASE_URL")

# ── AI / LLM ──
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

OPENROUTER_MODEL_ANALISI = os.getenv("OPENROUTER_MODEL_ANALISI", "qwen/qwen3-32b")
OPENROUTER_MODEL_RAGIONAMENTO = os.getenv(
    "OPENROUTER_MODEL_RAGIONAMENTO", "deepseek/deepseek-chat-v3-0324"
)
OPENROUTER_MODEL_DEFAULT = os.getenv(
    "OPENROUTER_MODEL_DEFAULT", "meta-llama/llama-3.3-70b-instruct"
)
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

LLM_PROVIDER_ORDER = [
    p.strip()
    for p in os.getenv("LLM_PROVIDER_ORDER", "openrouter,groq,gemini").split(",")
    if p.strip()
]

# ── Email SMTP ──
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# ── CORS ──
# Servono solo le origini che chiamano l'API da un indirizzo diverso (es. Live Server su :5500).
# nginx (/api) e le pagine servite dal backend (/app/) sono la stessa origine: non vanno elencate.
# Vuota di default: nessuna origine esterna autorizzata.
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "").split(",")
    if o.strip()
]

# ── Bootstrap admin (creato allo startup se assente) ──
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@amministratore.it")
# Facoltativa: se vuota, al primo avvio ne viene generata una casuale e scritta nei log.
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD") or None
