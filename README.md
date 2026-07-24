# ProgettoArcieri2

Gestionale web full-stack per la **Compagnia Arcieri Vicenza ASD**, per la gestione di atleti, materiali, allenamenti, visite mediche, antidoping, gare e punteggi.

Nasce come riscrittura di un precedente gestionale interno basato su Microsoft Access, portato su uno stack web moderno e containerizzato.

## Stack tecnologico

- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **Frontend:** HTML / CSS / JavaScript vanilla
- **Autenticazione:** JWT, con ruoli separati admin / istruttore / atleta
- **AI:** (coach virtuale)
- **Containerizzazione:** Docker Compose

## Funzionalità

**Lato Amministratore**
- Accesso riservato alla dashboard direzionale
- Gestione completa istruttori (creazione, modifica, eliminazione)
- Sospensione temporanea o a tempo indeterminato degli account istruttori
- Visione d'insieme degli atleti associati a ciascun istruttore

**Lato istruttore**
- Anagrafica atleti (creazione, modifica, eliminazione, ricerca e filtro)
- Gestione materiali e attrezzatura per atleta, con storico
- Pianificazione allenamenti su base settimanale: riscaldamento, tecnica/forza/coordinazione, stretching, forza-resistenza, coordinazione
- Calcolo automatico del totale frecce, giornaliero e settimanale
- Tabelle di supporto (esercizi, distanze, targhe, serie, ecc.) alimentabili direttamente dalla schermata di programmazione
- Visite mediche e autorizzazioni antidoping
- Piano gare
- Consultazione storico punteggi e gare degli atleti (in sola lettura)
- Assistant AI: analisi di allenamenti, materiali e storico punteggi su richiesta
- Ogni istruttore gestisce solo i propri atleti e vede anche gli atleti degli altri

**Lato atleta** (accesso in sola lettura, salvo dove indicato)
- Consultazione profilo, materiali, allenamenti, visite mediche, antidoping, piano gare
- Nota personale scrivibile su ciascuna settimana di allenamento
- Compilazione attiva del Segnapunti gara in stile World Archery (turni, volée, conteggio 10/X)

## Prerequisiti

- [Docker](https://www.docker.com/) e Docker Compose
- In alternativa, per lo sviluppo in locale senza container: Python 3.12, PostgreSQL, e un server statico qualsiasi per il frontend

## Avvio con Docker

1. Clona il repository
2. Crea un file `.env` nella root del progetto con le seguenti chiavi:

   ```env
   DB_USER=postgres
   DB_PASSWORD=123456
   DB_NAME=ProgettoArcieri
   DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
   
   SECRET_KEY=la_tua_chiave_segreta_lunga_e_casuale
   
   GEMINI_API_KEY=tua_api_key_gemini
   GEMINI_MODEL=gemini-2.5-flash
   
   OPENROUTER_API_KEY=tua_api_key_openrouter
   OPENROUTER_MODEL_ANALISI=google/gemini-2.5-flash-lite
   OPENROUTER_MODEL_RAGIONAMENTO=cognitivecomputations/dolphin3.0-r1-mistral-24b
   OPENROUTER_MODEL_DEFAULT=mistralai/mistral-nemo
   
   GROQ_API_KEY=tua_api_key_groq
   GROQ_MODEL=llama-3.3-70b-versatile
   LLM_PROVIDER_ORDER=openrouter,groq,gemini

   # Configurazioni Email SMTP
   SMTP_SERVER=smtp.gmail.com
   SMTP_USER=la_tua_email@example.com
   SMTP_PASSWORD=password_per_le_app
   ```

   **Dettagli configurazione ambiente:**
   - **`SECRET_KEY`**: Utilizzata per la firma dei token JWT. Deve essere una stringa lunga, casuale e segreta. L'utilizzo di valori prevedibili compromette la sicurezza.
   - **`GEMINI_API_KEY`**: Generabile su [Google AI Studio](https://aistudio.google.com/api-keys).
   - **`OPENROUTER_API_KEY`**: Generabile su [OpenRouter](https://openrouter.ai/workspaces/default/keys).
   - **`GROQ_API_KEY`**: Generabile su [Groq Cloud](https://console.groq.com/keys).
   - **`SMTP_*`**: Configurazioni necessarie affinché l'applicazione possa inviare email (es. le credenziali di accesso ai nuovi utenti creati).
     > Se usi una normale email **Gmail** (`smtp.gmail.com`), Google non ti permette di usare la tua password personale per motivi di sicurezza. Devi invece generare una **"Password per le app"**:
     > 1. Vai su [Gestione account Google](https://myaccount.google.com/).
     > 2. Clicca su **Sicurezza** nel menu a sinistra.
     > 3. Assicurati che la **Verifica in due passaggi** sia attiva, è obbligatorio.
     > 4. Usa la barra di ricerca in alto e cerca "Password per le app" (oppure vai in fondo alla sezione "Verifica in 2 passaggi").
     > 5. Seleziona un'app (scegli "Altro" e scrivi "ProgettoArcieri") e clicca **Genera**.
     > 6. Google ti mostrerà un codice di 16 lettere su sfondo giallo. Quella è la tua `SMTP_PASSWORD` (ricordati di scriverla nel `.env` senza spazi!).

3. Avvia tutto con:

   ```bash
   docker compose up --build
   ```

4. Servizi disponibili:

   | Servizio | URL |
   |---|---|
   | Frontend | http://localhost:8080 |
   | Backend / documentazione API (Swagger) | http://localhost:8000/docs |
   | pgAdmin | http://localhost:5050 |

Al primo avvio (volume del database vuoto) lo schema viene creato automaticamente. Se il volume esiste già da un avvio precedente, lo script di inizializzazione non viene rieseguito.

*Nota sulla Gestione Database in Docker:* In caso di necessità (es. per ripristinare il database allo stato iniziale), è possibile eliminare il volume dati di PostgreSQL usando il comando `docker volume rm progettoarcieri2_postgres_data` a container spenti.

## Avvio in locale (sviluppo)

```bash
# backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# frontend, da un altro terminale
cd frontend
python -m http.server 8080
```

Richiede un'istanza PostgreSQL raggiungibile con le credenziali indicate in `DATABASE_URL` nel `.env`.

## Primo accesso

Al primo avvio dell'applicazione, viene creato automaticamente un utente amministratore di default:
- **Email:** `admin@amministratore.it`
- **Password:** `admin` *(verrà richiesto di modificarla al primo accesso per motivi di sicurezza)*

L'Admin si occuperà poi di creare gli istruttori. Una volta creati, gli istruttori riceveranno via email una password automatica e potranno registrare i propri atleti (che a loro volta riceveranno le credenziali via email).

> [!TIP]
> **Trucco per testare in locale (Plus Addressing):**
> Visto che il database richiede che l'indirizzo email sia univoco, se stai sviluppando in locale e vuoi creare infiniti istruttori o atleti usando sempre la tua email personale (in modo da ricevere tu tutte le password generate), puoi sfruttare il trucco del segno `+`.
> Aggiungendo `+qualcosa` alla tua email, il database lo considererà un utente diverso, ma il provider di posta ignorerà la stringa aggiuntiva e ti recapiterà l'email.
> Esempio se la tua email è `nome.cognome@scuola.it`:
> - `nome.cognome+istruttore1@scuola.it`
> - `nome.cognome+istruttore2@scuola.it`
> - `nome.cognome+atleta_test@scuola.it`
> Arriveranno tutte nella tua casella `nome.cognome@scuola.it`!

## Struttura del progetto

```
ProgettoArcieri2/
├── backend/            FastAPI: controllers, services, repositories, schemas
├── frontend/           pagine statiche (Dashboard istruttore, Area Atleta, Autenticazione)
├── Arcieri_database/    schema PostgreSQL e Dockerfile del database
└── docker-compose.yml
```

Architettura backend a livelli: controller → service → repository, con le tabelle di lookup separate dalle tabelle di dettaglio.

## Roadmap

- [ ] Esportazione / stampa PDF della programmazione settimanale

## Autori e Contatti

Progetto sviluppato da Jiawei.
Per qualsiasi necessità, info o segnalazioni relative a questo progetto, puoi aprire una Issue su GitHub.
