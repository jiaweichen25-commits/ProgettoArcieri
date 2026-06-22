import os
from dotenv import load_dotenv
from pathlib import Path

# In locale carica il .env dalla root del progetto.
# In produzione (Docker) le variabili arrivano da docker-compose.yml — questa riga non fa nulla.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "segnaposto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

