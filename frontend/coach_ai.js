/**
 * COACH AI CORE EXECUTION SYSTEM - ARCHERY INTELLIGENCE ENGINE
 */

const BACKEND_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
let atleti = [];
let atletiVisualizzati = [];
let atletaSelezionato = null;
let conversationHistory = [];

function getToken() {
    return localStorage.getItem("access_token");
}

function getAuthHeaders() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
}

function requireAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = "../Autenticazione/Istruttore.html";
        return false;
    }
    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payload.ruolo !== "istruttore") {
            localStorage.clear();
            window.location.href = "../Autenticazione/Istruttore.html";
            return false;
        }
        document.getElementById("navUser").textContent = payload.sub || "Istruttore";
        return true;
    } catch {
        window.location.href = "../Autenticazione/Istruttore.html";
        return false;
    }
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser");
    window.location.href = "../Autenticazione/Istruttore.html";
}

async function caricaAtleti() {
    try {
        const response = await fetch(`${BACKEND_URL}/atleti/`, { headers: getAuthHeaders() });
        if (!response.ok) return usaDatiDiTest();
        atleti = await response.json();
        atletiVisualizzati = [...atleti];
        renderAtleti();
        aggiornaStats();
        controlloAtletaIniziale();
    } catch {
        usaDatiDiTest();
    }
}

function usaDatiDiTest() {
    atleti = [
        { IDatleta: 1, nome: "igli", cognome: "hasa", email: "igli@email.it", codice_fiscale: "HS987654A", citta: "Milano" }
    ];
    atletiVisualizzati = [...atleti];
    renderAtleti();
    aggiornaStats();
    controlloAtletaIniziale();
}

function renderAtleti() {
    const container = document.getElementById("athletesList");
    if (!container) return;
    document.getElementById("athletesCount").textContent = atletiVisualizzati.length;

    container.innerHTML = atletiVisualizzati.map(a => {
        const nome = a.nome || a.Nome || "";
        const cognome = a.cognome || a.Cognome || "";
        const email = a.email || a.Email || "";
        const id = a.IDatleta;
        const isActive = atletaSelezionato?.IDatleta === id;
        return `
        <div class="athlete-item ${isActive ? "active" : ""}" onclick="window.selezionaAtleta(${id})">
            <div class="athlete-avatar">${nome.substring(0, 2).toUpperCase()}</div>
            <div class="athlete-details">
                <div class="athlete-name">${nome} ${cognome}</div>
                <div class="athlete-info">${email}</div>
            </div>
        </div>`;
    }).join("");
}

window.selezionaAtleta = async function(idAtleta) {
    atletaSelezionato = atleti.find(a => a.IDatleta === idAtleta);
    renderAtleti();
    await caricaCronologia(idAtleta);
    renderAthleteSection();
    const nome = atletaSelezionato.nome || atletaSelezionato.Nome || "";
    const cognome = atletaSelezionato.cognome || atletaSelezionato.Cognome || "";
    document.getElementById("statSelezionato").textContent = `${nome} ${cognome}`;
};

async function caricaCronologia(idAtleta) {
    try {
        const res = await fetch(`${BACKEND_URL}/ai/cronologia/${idAtleta}`, { headers: getAuthHeaders() });
        if (res.ok) {
            const dati = await res.json();
            conversationHistory = dati.map(h => ({ q: h.Domanda, r: h.RispostaAI }));
        }
    } catch {
        conversationHistory = [];
    }
}

function renderAthleteSection() {
    const section = document.getElementById("athleteSection");
    if (!section || !atletaSelezionato) return;
    const a = atletaSelezionato;
    const nome = a.nome || a.Nome || "";
    const cognome = a.cognome || a.Cognome || "";
    const cf = a.codice_fiscale || a.Codice_Fiscale || "N/D";
    const email = a.email || a.Email || "N/D";
    const citta = a.citta || a.CITTA || "N/D";

    section.innerHTML = `
        <div class="athlete-data-panel">
            <div class="panel-title">Profilo: ${nome} ${cognome}</div>
            <div class="data-grid">
                <div class="data-item"><div class="data-label">Codice Fiscale</div><div class="data-value">${cf}</div></div>
                <div class="data-item"><div class="data-label">Email</div><div class="data-value">${email}</div></div>
                <div class="data-item"><div class="data-label">Città</div><div class="data-value">${citta}</div></div>
            </div>
        </div>
        <div class="input-section">
            <div class="panel-title">Consulenza Tecnica Coach AI</div>
            <textarea id="pyetjaAtletit" placeholder="Fai una domanda tecnica basata sui dati dell'atleta... (es: analizza la dispersione laterale, valuta la configurazione dell'arco, suggerisci un piano di allenamento)"></textarea>
            <button class="main-btn" id="btnPyet" onclick="window.chiediAI()">Richiedi Analisi AI</button>
        </div>
        <div id="pergjigja" style="display:none;"></div>
        <div class="history-section" id="historySection" style="display:${conversationHistory.length > 0 ? "block" : "none"};">
            <div class="panel-title">Cronologia Storica</div>
            <div id="historyList"></div>
        </div>`;

    if (conversationHistory.length > 0) window.renderHistory();
}

function formatRisposta(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>");
}

window.chiediAI = async function() {
    const pyetja = document.getElementById("pyetjaAtletit").value.trim();
    const divPergjigja = document.getElementById("pergjigja");
    const btn = document.getElementById("btnPyet");
    if (!pyetja) return;

    btn.disabled = true;
    btn.textContent = "Analisi in corso...";
    divPergjigja.style.display = "block";
    divPergjigja.innerHTML = `<div class="ai-header"><span class="loading-spinner"></span> Elaborazione richiesta nel database AI...</div>`;

    try {
        const response = await fetch(`${BACKEND_URL}/ai/chiedi`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                IDatleta: atletaSelezionato.IDatleta,
                RuoloUtente: "istruttore",
                Domanda: pyetja
            })
        });
        const data = await response.json();

        if (!response.ok) {
            divPergjigja.innerHTML = `<div class="ai-error">Errore: ${data.detail || "Risposta non disponibile"}</div>`;
            return;
        }

        conversationHistory.push({ q: pyetja, r: data.RispostaAI });

        divPergjigja.innerHTML = `
            <div class="ai-header">Risposta Coach AI</div>
            <div class="ai-body"><p>${formatRisposta(data.RispostaAI)}</p></div>`;

        document.getElementById("pyetjaAtletit").value = "";
        renderAthleteSection();
    } catch {
        divPergjigja.innerHTML = `<div class="ai-error">Errore di comunicazione con il server.</div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = "Richiedi Analisi AI";
    }
};

window.renderHistory = function() {
    const list = document.getElementById("historyList");
    if (!list) return;
    list.innerHTML = [...conversationHistory].reverse().map(h => `
        <div class="history-item">
            <div class="history-question">${h.q}</div>
            <div class="history-answer"><p>${formatRisposta(h.r)}</p></div>
        </div>`).join("");
};

function aggiornaStats() {
    const box = document.getElementById("statTotali");
    if (box) box.textContent = atleti.length;
}

function controlloAtletaIniziale() {
    const idTransitorio = localStorage.getItem("id_atleta_selezionato_ai");
    if (idTransitorio) {
        window.selezionaAtleta(parseInt(idTransitorio));
        localStorage.removeItem("id_atleta_selezionato_ai");
    }
}

function filtroAtleti(q) {
    const ql = q.toLowerCase();
    atletiVisualizzati = q
        ? atleti.filter(a => {
            const nome = (a.nome || a.Nome || "").toLowerCase();
            const cognome = (a.cognome || a.Cognome || "").toLowerCase();
            return nome.includes(ql) || cognome.includes(ql);
        })
        : [...atleti];
    renderAtleti();
}

window.addEventListener("DOMContentLoaded", () => {
    if (!requireAuth()) return;
    caricaAtleti();

    const searchInput = document.getElementById("aiSearch");
    if (searchInput) searchInput.addEventListener("input", e => filtroAtleti(e.target.value));
});
