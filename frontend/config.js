// Indirizzo del backend: l'unico punto da modificare.
// - Pagina servita dal backend stesso (porta 8000, /app/): stessa origine, niente CORS.
// - Pagina aperta da un altro indirizzo locale (es. Live Server): backend su localhost:8000,
//   funziona solo se quell'origine e' in CORS_ORIGINS. I file aperti dal disco (file://) sono bloccati.
// - Docker / server: il frontend e' servito da nginx (porta 8080 in locale), che inoltra /api al backend.
window.API_URL = (function () {
    if (location.port === "8000") return location.origin;
    const sviluppoLocale =
        ["localhost", "127.0.0.1", ""].includes(location.hostname) && location.port !== "8080";
    return sviluppoLocale ? "http://localhost:8000" : "/api";
})();
