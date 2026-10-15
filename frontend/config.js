// Indirizzo del backend: l'unico punto da modificare.
// - Pagina servita dal backend stesso (porta 8000, /app/): stessa origine, niente CORS.
// - Sviluppo locale (Live Server, file aperti dal disco): backend uvicorn su localhost:8000.
// - Docker / server: il frontend e' servito da nginx (porta 8080 in locale), che inoltra /api al backend.
window.API_URL = (function () {
    if (location.port === "8000") return location.origin;
    const sviluppoLocale =
        ["localhost", "127.0.0.1", ""].includes(location.hostname) && location.port !== "8080";
    return sviluppoLocale ? "http://localhost:8000" : "/api";
})();
