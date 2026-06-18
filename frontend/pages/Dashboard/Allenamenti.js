const API_URL = "http://localhost:8000";
const params = new URLSearchParams(window.location.search);
const ID_ATLETA = Number(params.get("atleta"));
const NOME_ATLETA = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";

let allenamentoCache = [];
let currentIdx = 0;

function getToken() { return localStorage.getItem("access_token"); }
function authHeaders() { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }

function requireAuth() {
  const token = getToken();
  if (!token) { window.location.href = "../Autenticazione/Istruttore.html"; return false; }
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
    if (payload.ruolo !== "istruttore") { localStorage.clear(); window.location.href = "../Autenticazione/Istruttore.html"; return false; }
    return true;
  } catch { window.location.href = "../Autenticazione/Istruttore.html"; return false; }
}

function tornaDashboard() { window.location.href = "Dashboard.html"; }
function toInputDate(iso) { if (!iso) return ""; return String(iso).slice(0,10); }

// ── API HELPERS ─────────────────────────────────────────────────────────────
function apiSett(allenamentoID)        { return `${API_URL}/allenamenti/${allenamentoID}/settimane/`; }
function apiNota(allenamentoID, sett)  { return `${API_URL}/allenamenti/${allenamentoID}/settimane/${sett}/nota/`; }
function apiIniz(allenamentoID, sett)  { return `${API_URL}/allenamenti/${allenamentoID}/settimane/${sett}/sedute/1/inizializza`; }

// ── API ─────────────────────────────────────────────────────────────────────
async function caricaAllenamenti() {
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/allenamenti/`, { headers: authHeaders() });
    if (res.status === 401) { localStorage.clear(); window.location.href = "../Autenticazione/Istruttore.html"; return; }
    if (!res.ok) return;
    allenamentoCache = await res.json();
    currentIdx = allenamentoCache.length > 0 ? allenamentoCache.length - 1 : 0;
    renderCurrent();
  } catch {}
}

// ── RENDER ──────────────────────────────────────────────────────────────────
async function renderCurrent() {
  const detail = document.getElementById("allenamentoDetail");
  const empty  = document.getElementById("emptyState");

  if (allenamentoCache.length === 0) {
    detail.style.display = "none";
    empty.style.display  = "block";
    document.getElementById("navCounter").textContent = "— / —";
    ["btnPrecedente","btnSuccessivo","btnPianoGare","btnModifica","btnElimina"].forEach(id => {
      document.getElementById(id).disabled = true;
    });
    return;
  }

  detail.style.display = "block";
  empty.style.display  = "none";

  const a = allenamentoCache[currentIdx];
  document.getElementById("navCounter").textContent = `${currentIdx + 1} / ${allenamentoCache.length}`;
  document.getElementById("dataInizio").value = toInputDate(a.data_inizio);
  document.getElementById("dataFine").value   = toInputDate(a.data_fine);
  document.getElementById("obiettivi").value  = a.obiettivi || "";

  document.getElementById("btnPrecedente").disabled = currentIdx <= 0;
  document.getElementById("btnSuccessivo").disabled = currentIdx >= allenamentoCache.length - 1;
  document.getElementById("btnPianoGare").disabled  = false;
  document.getElementById("btnModifica").disabled   = false;
  document.getElementById("btnElimina").disabled    = false;

  await renderSettimane(a.IDallenamento);
}

// ── NAVIGAZIONE ─────────────────────────────────────────────────────────────
function navPrecedente() { if (currentIdx > 0) { currentIdx--; renderCurrent(); } }
function navSuccessivo() { if (currentIdx < allenamentoCache.length - 1) { currentIdx++; renderCurrent(); } }

// ── PIANO GARE ───────────────────────────────────────────────────────────────
function goPianoGare() {
  const a = allenamentoCache[currentIdx];
  if (!a) return;
  const q = new URLSearchParams({
    allenamento: a.IDallenamento,
    atleta:  ID_ATLETA,
    nome:    NOME_ATLETA,
    cognome: COGNOME_ATLETA,
    inizio:  a.data_inizio,
    fine:    a.data_fine,
  });
  window.location.href = `Pianogare.html?${q.toString()}`;
}

// ── MODALI ───────────────────────────────────────────────────────────────────
function chiudiModal(id) { document.getElementById(id).classList.remove("open"); }
function chiudiSeFuori(e, id) { if (e.target.id === id) chiudiModal(id); }

function openAddModal() {
  document.getElementById("addInizio").value   = "";
  document.getElementById("addFine").value     = "";
  document.getElementById("addObiettivi").value = "";
  document.getElementById("addMsg").className  = "m-msg";
  document.getElementById("addModal").classList.add("open");
}

function openModificaModal() {
  const a = allenamentoCache[currentIdx];
  if (!a) return;
  document.getElementById("modInizio").value    = toInputDate(a.data_inizio);
  document.getElementById("modFine").value      = toInputDate(a.data_fine);
  document.getElementById("modObiettivi").value = a.obiettivi || "";
  document.getElementById("modificaMsg").className = "m-msg";
  document.getElementById("modificaModal").classList.add("open");
}

function openEliminaModal() {
  const a = allenamentoCache[currentIdx];
  if (!a) return;
  document.getElementById("eliminaMsg").textContent =
    `Eliminare l'allenamento dal ${toInputDate(a.data_inizio)} al ${toInputDate(a.data_fine)}?`;
  document.getElementById("eliminaModal").classList.add("open");
}

// ── SALVA NUOVO ──────────────────────────────────────────────────────────────
async function salvaNuovo() {
  const data_inizio = document.getElementById("addInizio").value;
  const data_fine   = document.getElementById("addFine").value;
  const obiettivi   = document.getElementById("addObiettivi").value.trim() || null;
  const msgEl       = document.getElementById("addMsg");

  if (!data_inizio || !data_fine) {
    msgEl.textContent = "Le date sono obbligatorie."; msgEl.className = "m-msg show"; return;
  }
  if (data_fine <= data_inizio) {
    msgEl.textContent = "La data fine deve essere successiva all'inizio."; msgEl.className = "m-msg show"; return;
  }
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/allenamenti/`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ data_inizio, data_fine, obiettivi }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      msgEl.textContent = err.detail || "Errore."; msgEl.className = "m-msg show"; return;
    }
    chiudiModal("addModal");
    await caricaAllenamenti();
  } catch { msgEl.textContent = "Impossibile contattare il server."; msgEl.className = "m-msg show"; }
}

// ── SALVA MODIFICA ───────────────────────────────────────────────────────────
async function salvaModifica() {
  const a           = allenamentoCache[currentIdx];
  const data_inizio = document.getElementById("modInizio").value;
  const data_fine   = document.getElementById("modFine").value;
  const obiettivi   = document.getElementById("modObiettivi").value.trim() || null;
  const msgEl       = document.getElementById("modificaMsg");

  if (!data_inizio || !data_fine) {
    msgEl.textContent = "Le date sono obbligatorie."; msgEl.className = "m-msg show"; return;
  }
  if (data_fine <= data_inizio) {
    msgEl.textContent = "La data fine deve essere successiva all'inizio."; msgEl.className = "m-msg show"; return;
  }
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/allenamenti/${a.IDallenamento}`, {
      method: "PUT", headers: authHeaders(),
      body: JSON.stringify({ data_inizio, data_fine, obiettivi }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      msgEl.textContent = err.detail || "Errore."; msgEl.className = "m-msg show"; return;
    }
    chiudiModal("modificaModal");
    await caricaAllenamenti();
  } catch { msgEl.textContent = "Impossibile contattare il server."; msgEl.className = "m-msg show"; }
}

// ── CONFERMA ELIMINA ─────────────────────────────────────────────────────────
async function confermaElimina() {
  const a = allenamentoCache[currentIdx];
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/allenamenti/${a.IDallenamento}`, {
      method: "DELETE", headers: authHeaders(),
    });
    if (!res.ok && res.status !== 204) { alert("Errore nell'eliminazione."); return; }
    chiudiModal("eliminaModal");
    await caricaAllenamenti();
  } catch { alert("Impossibile contattare il server."); }
}

// ── SETTIMANE ────────────────────────────────────────────────────────────────
async function renderSettimane(allenamentoID) {
  const tbody = document.getElementById("settimaneBody");
  tbody.innerHTML = "";

  let settimane = [];
  try {
    const res = await fetch(apiSett(allenamentoID), { headers: authHeaders() });
    if (res.ok) settimane = await res.json();
  } catch {}

  settimane.forEach(s => {
    const tr = document.createElement("tr");
    tr.dataset.sett = s.IDsettimana;
    tr.innerHTML = `
      <td class="td-num">
        <input class="sett-num" type="number" value="${s.IDsettimana}" placeholder="N°" readonly style="background:transparent;border:none;cursor:default;">
      </td>
      <td>
        <input class="sett-obj" type="text" value="${escHtml(s.obiettivo || "")}" placeholder="Obiettivo settimana..."
          onblur="saveRow(this.closest('tr'), ${allenamentoID})"
          onkeydown="if(event.key==='Enter'){ saveRow(this.closest('tr'), ${allenamentoID}); nextEmptyRow(); }">
      </td>
      <td class="td-actions">
        <button class="sett-btn sett-btn-det" onclick="apriDettagliSettimana(${s.IDsettimana}, ${allenamentoID})" title="Dettagli Seduta">&#128203;</button>
        <button class="sett-btn sett-btn-del" onclick="eliminaSettimana(${s.IDsettimana}, ${allenamentoID})" title="Elimina">&#10005;</button>
      </td>`;
    tbody.appendChild(tr);
  });

  addEmptyInputRow(tbody, allenamentoID);
}

function addEmptyInputRow(tbody, allenamentoID) {
  const tr = document.createElement("tr");
  tr.className = "empty-input-row";
  tr.innerHTML = `
    <td class="td-num">
      <input class="sett-num" type="number" placeholder="N°"
        onblur="checkNewRow(this.closest('tr'), ${allenamentoID})">
    </td>
    <td>
      <input class="sett-obj" type="text" placeholder=""
        onblur="checkNewRow(this.closest('tr'), ${allenamentoID})"
        onkeydown="if(event.key==='Enter') checkNewRow(this.closest('tr'), ${allenamentoID})">
    </td>
    <td class="td-actions">
      <button class="sett-btn sett-btn-det" disabled>&#128203;</button>
      <button class="sett-btn sett-btn-del" disabled>&#10005;</button>
    </td>`;
  tbody.appendChild(tr);
}

async function checkNewRow(tr, allenamentoID) {
  const numVal = tr.querySelector(".sett-num").value.trim();
  const objVal = tr.querySelector(".sett-obj").value.trim();
  if (!numVal) return;
  const numSett = parseInt(numVal);
  if (!numSett || numSett < 1) return;
  try {
    await fetch(apiIniz(allenamentoID, numSett), { method: "POST", headers: authHeaders() });
    if (objVal) {
      await fetch(apiNota(allenamentoID, numSett), {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ nota: JSON.stringify({ obiettivo: objVal }) }),
      });
    }
  } catch {}
  renderSettimane(allenamentoID);
}

async function saveRow(tr, allenamentoID) {
  const numSett = Number(tr.dataset.sett);
  if (!numSett) return;
  const objVal = tr.querySelector(".sett-obj").value.trim();
  try {
    let existing = {};
    const r = await fetch(apiNota(allenamentoID, numSett), { headers: authHeaders() });
    if (r.ok) {
      const row = await r.json();
      if (row?.nota) { try { existing = JSON.parse(row.nota); } catch {} }
    }
    existing.obiettivo = objVal;
    await fetch(apiNota(allenamentoID, numSett), {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ nota: JSON.stringify(existing) }),
    });
  } catch {}
}

async function eliminaSettimana(numSett, allenamentoID) {
  try {
    await fetch(`${API_URL}/allenamenti/${allenamentoID}/settimane/${numSett}/`, {
      method: "DELETE", headers: authHeaders(),
    });
  } catch {}
  renderSettimane(allenamentoID);
}

function apriDettagliSettimana(numSett, allenamentoID) {
  const a = allenamentoCache[currentIdx];
  const q = new URLSearchParams({
    allenamento: allenamentoID,
    atleta:    ID_ATLETA,
    nome:      NOME_ATLETA,
    cognome:   COGNOME_ATLETA,
    inizio:    a.data_inizio,
    fine:      a.data_fine,
    settimana: numSett,
    seduta:    1,
  });
  document.getElementById("modal-iframe").src = `Allenamento.FC/ProgrammazioneSettimana.html?${q.toString()}`;
  document.getElementById("modal-dettagli").classList.add("open");
}

function chiudiDettagliModal() {
  document.getElementById("modal-dettagli").classList.remove("open");
  document.getElementById("modal-iframe").src = "";
}

function chiudiModaleSeFuori(e) {
  if (e.target === document.getElementById("modal-dettagli")) chiudiDettagliModal();
}

function nextEmptyRow() {
  const empty = document.querySelector(".empty-input-row .sett-obj");
  if (empty) empty.focus();
}

function escHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
}

// ── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  if (!ID_ATLETA) { window.location.href = "Dashboard.html"; return; }
  const nome = [NOME_ATLETA, COGNOME_ATLETA].filter(Boolean).join(" ");
  document.getElementById("atletaName").textContent = nome || "—";
  caricaAllenamenti();
});
