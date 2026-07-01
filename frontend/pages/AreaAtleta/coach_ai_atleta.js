const BACKEND_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
let conversationHistory = [];
let atletaInfo = null;

function getToken() {
    return localStorage.getItem("access_token");
}

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

function requireAuth() {
    const token = getToken();
    if (!token) { window.location.href = "Atleti.html"; return false; }
    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payload.ruolo !== "atleta") { localStorage.clear(); window.location.href = "Atleti.html"; return false; }
        return true;
    } catch { window.location.href = "Atleti.html"; return false; }
}

function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "../Autenticazione/Atleti.html";
}

async function caricaProfilo() {
    try {
        const res = await fetch(`${BACKEND_URL}/me/profilo`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const p = await res.json();
        atletaInfo = p;
        document.getElementById("navUser").textContent = `${p.nome} ${p.cognome}`;
        document.getElementById("atletaNome").textContent = `${p.nome} ${p.cognome}`;
        document.getElementById("atletaCf").textContent = p.codice_fiscale || "—";
        document.getElementById("atletaCitta").textContent = p.citta || "—";
        document.getElementById("atletaEmail").textContent = p.email || "—";
    } catch { console.error("Errore profilo"); }
}

async function caricaCronologia() {
    try {
        const res = await fetch(`${BACKEND_URL}/ai/atleta/cronologia`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const dati = await res.json();
        conversationHistory = dati.map(h => ({ q: h.Domanda, r: h.RispostaAI }));
        if (conversationHistory.length > 0) renderHistory();
    } catch { conversationHistory = []; }
}

function formatRisposta(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>");
}

window.chiediAI = async function() {
    const domanda = document.getElementById("inputDomanda").value.trim();
    const divRisposta = document.getElementById("rispostaBox");
    const btn = document.getElementById("btnChiedi");
    if (!domanda) return;

    btn.disabled = true;
    btn.textContent = "Analisi in corso...";
    divRisposta.style.display = "block";
    divRisposta.innerHTML = `<div class="ai-header"><span class="loading-spinner"></span> Il Coach AI sta analizzando i tuoi dati...</div>`;

    try {
        const res = await fetch(`${BACKEND_URL}/ai/atleta/chiedi`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ Domanda: domanda })
        });
        const data = await res.json();

        if (!res.ok) {
            divRisposta.innerHTML = `<div class="ai-error">Errore: ${data.detail || "Risposta non disponibile"}</div>`;
            return;
        }

        conversationHistory.push({ q: domanda, r: data.RispostaAI });
        divRisposta.innerHTML = `
            <div class="ai-header">Risposta Coach AI</div>
            <div class="ai-body"><p>${formatRisposta(data.RispostaAI)}</p></div>`;

        document.getElementById("inputDomanda").value = "";
        renderHistory();

        const histSec = document.getElementById("historySection");
        if (histSec) histSec.style.display = "block";
    } catch {
        divRisposta.innerHTML = `<div class="ai-error">Errore di comunicazione con il server.</div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = "Chiedi al Coach AI";
    }
};

function renderHistory() {
    const histSec = document.getElementById("historySection");
    const list = document.getElementById("historyList");
    if (!list) return;
    if (conversationHistory.length === 0) { if (histSec) histSec.style.display = "none"; return; }
    if (histSec) histSec.style.display = "block";
    list.innerHTML = [...conversationHistory].reverse().map(h => `
        <div class="history-item">
            <div class="history-question">${h.q}</div>
            <div class="history-answer"><p>${formatRisposta(h.r)}</p></div>
        </div>`).join("");
}

window.addEventListener("DOMContentLoaded", async () => {
    if (!requireAuth()) return;
    await caricaProfilo();
    await caricaCronologia();
});
