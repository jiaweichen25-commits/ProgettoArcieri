Questa cartella (Services) contiene il "cervello" dell'applicazione (la logica di business o Business Logic).
Cosa inserire qui:
- Hashing delle password e relativi controlli.
- Generazione dei token JWT.
- Regole dell'applicazione (es. "Se l'utente esiste già, genera errore").
Il service è il direttore d'orchestra: riceve le richieste dal "controller", chiede i dati dal "repository", li elabora e restituisce il risultato finale.
