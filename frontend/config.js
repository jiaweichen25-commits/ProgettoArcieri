// Indirizzo del backend: l'unico punto da modificare.
// - Sviluppo locale (Live Server, file aperti dal disco): backend uvicorn su localhost:8000.
// - Docker / server: il frontend e' servito da nginx (porta 8080 in locale), che inoltra /api al backend.
window.API_URL = (function () {
    const sviluppoLocale =
        ["localhost", "127.0.0.1", ""].includes(location.hostname) && location.port !== "8080";
    return sviluppoLocale ? "http://localhost:8000" : "/api";
})();
