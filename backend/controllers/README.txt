Questa cartella (Controllers o Routers) serve per definire gli indirizzi finali delle tue API (le rotte FastAPI come @router.post("/login")).
Cosa inserire qui:
- La definizione degli URL.
- I metodi HTTP consentiti (GET, POST, ecc.).
Regola d'oro: i file qui dentro NON dovrebbero contenere query SQL o logica complessa. Devono limitarsi a ricevere la richiesta dall'utente, chiamare il Service, e restituire la risposta.
