import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def invia_email_credenziali(destinatario: str, password_temporanea: str, ruolo: str = "atleta"):
    oggetto = "Credenziali di accesso - Arcieri Vicenza"
    
    corpo = f"""
    Benvenuto in Arcieri Vicenza!
    
    Il tuo account come {ruolo} è stato creato con successo.
    Ecco le tue credenziali per il primo accesso:
    
    Email: {destinatario}
    Password Temporanea: {password_temporanea}
    
    Al primo accesso ti verrà richiesto di cambiare la password.
    
    Cordiali saluti,
    Lo staff di Arcieri Vicenza
    """
    
    if not SMTP_SERVER or not SMTP_USER or not SMTP_PASSWORD:
        print(f"\n[EMAIL MOCK] Email a {destinatario}")
        print(f"[EMAIL MOCK] Oggetto: {oggetto}")
        print(f"[EMAIL MOCK] Password Temporanea: {password_temporanea}\n")
        return

    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = destinatario
    msg['Subject'] = oggetto
    msg.attach(MIMEText(corpo, 'plain'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_USER, destinatario, text)
        server.quit()
        print(f"Email inviata con successo a {destinatario}")
    except Exception as e:
        print(f"Errore durante l'invio dell'email a {destinatario}: {str(e)}")
        # Non rilancio l'eccezione per non bloccare la creazione, ma si potrebbe gestire meglio
