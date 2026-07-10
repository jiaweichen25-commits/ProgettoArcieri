import os
from dotenv import load_dotenv
from pathlib import Path

# In locale carica il .env dalla root del progetto.
# In produzione (Docker) le variabili arrivano da docker-compose.yml — questa riga non fa nulla.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "segnaposto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

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

