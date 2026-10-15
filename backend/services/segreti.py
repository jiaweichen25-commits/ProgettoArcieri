import secrets
import string

# Valori che proteggono un account: vanno generati con `secrets` (generatore
# crittografico del sistema operativo), non con `random`, che e' prevedibile.

_CARATTERI_PASSWORD = string.ascii_letters + string.digits


def genera_password_temporanea(lunghezza: int = 8) -> str:
    """Password provvisoria inviata via email, da cambiare al primo accesso."""
    return "".join(secrets.choice(_CARATTERI_PASSWORD) for _ in range(lunghezza))


def genera_otp() -> str:
    """Codice di recupero password a 6 cifre (da 100000 a 999999)."""
    return str(100000 + secrets.randbelow(900000))
