Questa cartella (Services) serve a isolare tutte le comunicazioni (le chiamate di rete) con il tuo backend.
Cosa inserire qui:
- authService.js (conterrà le chiamate fetch() per login e registrazione)
- dashboardService.js (per richiedere i dati degli allenamenti)
- Un file generico api.js (per gestire l'URL base del backend e allegare in automatico il token JWT)

Così facendo, il codice delle tue pagine HTML sarà pulitissimo: invece di scrivere lunghe fetch(), scriverai semplicemente una cosa tipo "authService.login(email, password)".
