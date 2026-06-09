const API_URL = "http://localhost:8000";

let currentUser = null;
let _istrList   = [];
let la_atleti   = [];
let la_selected = null;

/* ── API helper ─────────────────────────── */
function authHeader() {
    return {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json"
    };
}

async function api(method, path, body = null) {
    const opts = { method, headers: authHeader() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${path}`, opts);
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Errore server");
    }
    return res.status === 204 ? null : res.json();
}

/* ── AUTH ───────────────────────────────── */
function logout() {
    localStorage.clear();
    location.href = "../../index.html";
}

/* ── INIT ───────────────────────────────── */
async function init() {
    currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) { logout(); return; }
    if (currentUser.role !== "istruttore") {
        location.href = currentUser.role === "atleta"
            ? "AtletaDashboard.html"
            : "../../index.html";
        return;
    }
    document.getElementById("navUser").textContent = currentUser.email;
    await loadAndRender();
    if (new URLSearchParams(location.search).get("panel") === "atleti") {
        await openAtletiPanel();
    }
}

async function loadAndRender() {
    try {
        _istrList = await api("GET", "/istruttori") || [];
        render();
    } catch (e) {
        console.error("Errore caricamento:", e);
    }
}

/* ── DASHBOARD RENDER ───────────────────── */
function render() {
    const myEmail = currentUser?.email || "";
    const allAtl  = _istrList.flatMap(i => i.atleti || []);
    const myIstr  = _istrList.find(i => i["E-mail"] === myEmail);
    const myAtl   = myIstr ? (myIstr.atleti || []) : [];

    document.getElementById("cntIstr").textContent   = _istrList.length;
    document.getElementById("cntMyAtl").textContent  = myAtl.length;
    document.getElementById("cntTotAtl").textContent = allAtl.length;

    const tbody = document.getElementById("mainBody");
    if (_istrList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--muted)">Nessun istruttore registrato</td></tr>`;
        return;
    }

    tbody.innerHTML = _istrList.map((istr, idx) => {
        const isOwn    = istr["E-mail"] === myEmail;
        const athletes = istr.atleti || [];
        const rowId    = `sub-${idx}`;
        const fullName = [istr.Nome, istr.Cognome].filter(Boolean).join(" ") || "—";

        const mainRow = `
          <tr class="${isOwn ? "own-row" : ""}" data-idx="${idx}">
            <td><button class="expand-btn" id="btn-${rowId}" onclick="toggleSub('${rowId}',this)">▸</button></td>
            <td style="color:var(--muted)">#${istr.IDistruttore}</td>
            <td>
              <strong>${fullName}</strong>
              ${isOwn ? '<span style="font-size:0.62rem;color:var(--red);font-weight:700;margin-left:6px">(TU)</span>' : ""}
              <br><span style="color:var(--muted);font-size:0.76rem">${istr["E-mail"] || ""}</span>
            </td>
            <td>${istr.Qualifica || "—"}</td>
            <td><span class="badge ${istr.Stato === "Attivo" ? "badge-green" : "badge-muted"}">${istr.Stato || "Attivo"}</span></td>
            <td style="color:var(--muted);font-size:0.82rem">${athletes.length} atleti</td>
            <td class="actions-cell">
              ${isOwn
                ? `<button class="btn-sm btn-edit" onclick="openAtletiPanel()">I miei atleti</button>
                   <button class="btn-sm btn-edit" onclick="openMyProfile()">Profilo</button>`
                : `<span style="font-size:0.72rem;color:var(--muted)">Solo lettura</span>`}
            </td>
          </tr>`;

        const atlRows = athletes.length === 0
          ? `<tr><td colspan="${isOwn ? 5 : 4}" class="sub-empty">Nessun atleta nella lista</td></tr>`
          : athletes.map(a => `
              <tr>
                <td style="color:var(--muted)">${a.Foto || "👤"}</td>
                <td><strong>${a.Nome || "—"} ${a.Cognome || ""}</strong><br>
                    <span style="color:var(--muted);font-size:0.74rem">${a["E-mail"] || ""}</span></td>
                <td>${a.CITTA || "—"}</td>
                <td>${a.DataNascita || "—"}</td>
                ${isOwn ? `<td class="actions-cell"><button class="btn-sm btn-edit" onclick="openAtletiPanel()">Gestisci</button></td>` : ""}
              </tr>`).join("");

        const subRow = `
          <tr class="sub-row" id="${rowId}">
            <td class="sub-cell" colspan="7">
              <div class="sub-inner">
                <div class="sub-head">
                  <span class="sub-label">Lista atleti${isOwn ? " (la tua)" : " — solo lettura"}</span>
                  ${isOwn ? `<button class="btn-sm btn-edit" onclick="openAtletiPanel()">→ Gestisci in I miei atleti</button>` : ""}
                </div>
                <table class="sub-table">
                  <thead><tr><th>Foto</th><th>Nome</th><th>Città</th><th>Data Nascita</th>${isOwn ? "<th>Azioni</th>" : ""}</tr></thead>
                  <tbody>${atlRows}</tbody>
                </table>
              </div>
            </td>
          </tr>`;

        return mainRow + subRow;
    }).join("");
}

function toggleSub(rowId, btn) {
    const row  = document.getElementById(rowId);
    const open = row.classList.toggle("open");
    btn.classList.toggle("open", open);
    btn.textContent = open ? "▾" : "▸";
}

/* ── PROFILO ISTRUTTORE ─────────────────── */
function openMyProfile() {
    const istr = _istrList.find(i => i["E-mail"] === currentUser.email);
    if (!istr) return;
    document.getElementById("istrNome").value      = istr.Nome      || "";
    document.getElementById("istrCognome").value   = istr.Cognome   || "";
    document.getElementById("istrQualifica").value = istr.Qualifica || "";
    document.getElementById("istrCellulare").value = istr.Cellulare || "";
    document.getElementById("istrEmail").value     = istr["E-mail"] || "";
    document.getElementById("istrStato").value     = istr.Stato     || "Attivo";
    document.getElementById("modalIstr").classList.add("open");
}

async function saveMyProfile() {
    try {
        await api("PUT", "/istruttori/me", {
            Nome:      document.getElementById("istrNome").value.trim(),
            Cognome:   document.getElementById("istrCognome").value.trim(),
            Qualifica: document.getElementById("istrQualifica").value.trim(),
            Cellulare: document.getElementById("istrCellulare").value.trim(),
            Stato:     document.getElementById("istrStato").value,
        });
        closeModal("modalIstr");
        await loadAndRender();
    } catch (e) {
        alert("Errore salvataggio profilo: " + e.message);
    }
}

function closeModal(id) { document.getElementById(id).classList.remove("open"); }


/* ══════════════════════════════════════════
   I MIEI ATLETI — PANEL
══════════════════════════════════════════ */
async function openAtletiPanel() {
    document.getElementById("panelIstrName").textContent = currentUser?.email || "—";
    await la_loadAtleti();
    document.getElementById("atletiPanel").classList.add("open");
}

async function closeAtletiPanel() {
    document.getElementById("atletiPanel").classList.remove("open");
    await loadAndRender();
}

async function la_loadAtleti() {
    try {
        la_atleti   = await api("GET", "/atleti/miei") || [];
        la_selected = null;
        la_renderTable(la_atleti);
    } catch (e) {
        console.error(e);
    }
}

function la_renderTable(list) {
    const tbody = document.getElementById("la-tbody");
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" class="la-empty">Nessun atleta registrato.</td></tr>`;
        return;
    }
    tbody.innerHTML = list.map((a, i) => `
        <tr onclick="la_selectRow(this,${i})" style="cursor:pointer">
            <td>${a.Foto || "👤"}</td>
            <td>${a.IDatleta}</td>
            <td><strong>${a.Nome}</strong></td>
            <td><strong>${a.Cognome}</strong></td>
            <td>${a.Indirizzo || "—"}</td>
            <td>${a.CAP || "—"}</td>
            <td>${a.CITTA || "—"}</td>
            <td>${a.Codice_Fiscale || "—"}</td>
            <td>${a.Telefono || "—"}</td>
            <td>${a.Cellulare || "—"}</td>
            <td><a href="mailto:${a["E-mail"] || ""}" style="color:#c53030">${a["E-mail"] || "—"}</a></td>
            <td>${a.DataNascita || "—"}</td>
        </tr>`).join("");
}

function la_selectRow(tr, idx) {
    document.querySelectorAll("#la-tbody tr").forEach(r => r.classList.remove("la-selected"));
    tr.classList.add("la-selected");
    la_selected = la_atleti[idx];
}

function la_filterTable() {
    const q = document.getElementById("la-search").value.toLowerCase();
    document.querySelectorAll("#la-tbody tr").forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
    });
}

function la_openModal(id)  { document.getElementById(id).classList.add("open"); }
function la_closeModal(id) { document.getElementById(id).classList.remove("open"); }

function la_showSuccess(msg) {
    const el = document.getElementById("la-success-msg");
    el.innerHTML = `<div class="la-success">${msg}</div>`;
    setTimeout(() => { el.innerHTML = ""; }, 3000);
}

/* ── TOOLBAR ────────────────────────────── */

/* 📋 Anagrafica */
function la_openAnagrafica() {
    if (!la_selected) { alert("Seleziona un atleta dalla lista"); return; }
    const a = la_selected;
    document.getElementById("la-ana-id").value        = a.IDatleta;
    document.getElementById("la-ana-nome").value      = a.Nome;
    document.getElementById("la-ana-cognome").value   = a.Cognome;
    document.getElementById("la-ana-indirizzo").value = a.Indirizzo || "";
    document.getElementById("la-ana-cap").value       = a.CAP || "";
    document.getElementById("la-ana-citta").value     = a.CITTA || "";
    document.getElementById("la-ana-cf").value        = a.Codice_Fiscale || "";
    document.getElementById("la-ana-tel").value       = a.Telefono || "";
    document.getElementById("la-ana-cell").value      = a.Cellulare || "";
    document.getElementById("la-ana-email").value     = a["E-mail"] || "";
    document.getElementById("la-ana-data").value      = a.DataNascita || "";
    la_openModal("la-ana-modal");
}

async function la_salvaAnagrafica() {
    if (!la_selected) return;
    try {
        await api("PUT", `/atleti/${la_selected.IDatleta}`, {
            Nome:           document.getElementById("la-ana-nome").value,
            Cognome:        document.getElementById("la-ana-cognome").value,
            Indirizzo:      document.getElementById("la-ana-indirizzo").value,
            CAP:            document.getElementById("la-ana-cap").value,
            CITTA:          document.getElementById("la-ana-citta").value,
            Codice_Fiscale: document.getElementById("la-ana-cf").value,
            Telefono:       document.getElementById("la-ana-tel").value,
            Cellulare:      document.getElementById("la-ana-cell").value,
            "E-mail":       document.getElementById("la-ana-email").value,
            DataNascita:    document.getElementById("la-ana-data").value || null,
        });
        await la_loadAtleti();
        la_showSuccess("Anagrafica aggiornata!");
        la_closeModal("la-ana-modal");
    } catch (e) { alert("Errore: " + e.message); }
}

/* ❌ Elimina */
async function la_deleteSelected() {
    if (!la_selected) { alert("Seleziona un atleta dalla lista"); return; }
    if (!confirm(`Eliminare ${la_selected.Nome} ${la_selected.Cognome}?`)) return;
    try {
        await api("DELETE", `/atleti/${la_selected.IDatleta}`);
        la_selected = null;
        await la_loadAtleti();
        la_showSuccess("Atleta eliminato.");
    } catch (e) { alert("Errore: " + e.message); }
}

/* ⚙️ Materiali */
function la_openMateriali() {
    if (!la_selected) { alert("Seleziona un atleta dalla lista"); return; }
    const nome = encodeURIComponent(`${la_selected.Nome} ${la_selected.Cognome}`.trim());
    window.location.href = `../MaterialiAtleta/L.Materiali.html?id=${la_selected.IDatleta}&nome=${nome}`;
}

/* 📄 Visualizza Allenamenti */
async function la_viewWorkouts() {
    if (!la_selected) { alert("Seleziona un atleta dalla lista"); return; }
    try {
        const workouts = await api("GET", `/allenamenti/${la_selected.IDatleta}`) || [];
        document.getElementById("la-work-title").textContent =
            `${la_selected.Nome} ${la_selected.Cognome}`;
        const listEl = document.getElementById("la-work-list");
        listEl.innerHTML = workouts.length === 0
            ? `<p style="color:var(--muted);text-align:center;padding:20px">Nessun allenamento registrato.</p>`
            : workouts.map(w => `
                <div class="work-item">
                    <strong>${w.DataInizio} → ${w.DataFine}</strong>
                    <div style="color:var(--muted);margin-top:4px">${w.Obiettivi || "—"}</div>
                </div>`).join("");
        la_openModal("la-work-modal");
    } catch (e) { alert("Errore: " + e.message); }
}

/* ✏️ Programmazione Settimanale */
function la_openAddWorkout() {
    if (!la_selected) { alert("Seleziona un atleta dalla lista"); return; }
    const nome = encodeURIComponent(`${la_selected.Nome} ${la_selected.Cognome}`.trim());
    window.location.href = `../SettimanaAllenamenti/L.Allenamenti.html?id=${la_selected.IDatleta}&nome=${nome}`;
}

async function la_salvaAllenamento() {
    if (!la_selected) return;
    const dataInizio = document.getElementById("la-work-datainizio").value;
    const dataFine   = document.getElementById("la-work-datafine").value;
    if (!dataInizio || !dataFine) { alert("Inserisci le date di inizio e fine."); return; }
    try {
        await api("POST", "/allenamenti", {
            IDatleta:   la_selected.IDatleta,
            DataInizio: dataInizio,
            DataFine:   dataFine,
            Obiettivi:  document.getElementById("la-work-obiettivi").value || null,
        });
        la_showSuccess("Allenamento aggiunto!");
        la_closeModal("la-addwork-modal");
    } catch (e) { alert("Errore: " + e.message); }
}

/* ── NUOVO ATLETA ────────────────────────── */
function la_openAddModal() {
    document.getElementById("la-new-id").value = "—";
    ["la-new-nome","la-new-cognome","la-new-indirizzo","la-new-cap",
     "la-new-citta","la-new-cf","la-new-tel","la-new-cell",
     "la-new-email","la-new-data"].forEach(id => document.getElementById(id).value = "");
    la_openModal("la-add-modal");
}

async function la_salvaAtletaNuovo() {
    const nome = document.getElementById("la-new-nome").value.trim();
    if (!nome) { alert("Il nome è obbligatorio"); return; }
    try {
        await api("POST", "/atleti", {
            Nome:           nome,
            Cognome:        document.getElementById("la-new-cognome").value.trim() || "N/A",
            Indirizzo:      document.getElementById("la-new-indirizzo").value,
            CAP:            document.getElementById("la-new-cap").value,
            CITTA:          document.getElementById("la-new-citta").value,
            Codice_Fiscale: document.getElementById("la-new-cf").value,
            Telefono:       document.getElementById("la-new-tel").value,
            Cellulare:      document.getElementById("la-new-cell").value,
            "E-mail":       document.getElementById("la-new-email").value,
            DataNascita:    document.getElementById("la-new-data").value || null,
        });
        await la_loadAtleti();
        la_showSuccess(`${nome} aggiunto!`);
        la_closeModal("la-add-modal");
    } catch (e) { alert("Errore: " + e.message); }
}

/* ── BOOTSTRAP ──────────────────────────── */
document.querySelectorAll(".overlay").forEach(el => {
    el.addEventListener("click", e => { if (e.target === el) el.classList.remove("open"); });
});

init();
