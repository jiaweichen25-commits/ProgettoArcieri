const API_URL   = "http://localhost:8000";
const params    = new URLSearchParams(location.search);
const atID      = params.get("atleta") || "";
const atNome    = [
  decodeURIComponent(params.get("nome")    || ""),
  decodeURIComponent(params.get("cognome") || "")
].filter(Boolean).join(" ") || "Atleta";
const allenamentoID = Number(params.get("allenamento")) || 0;

function getToken()    { return localStorage.getItem("access_token"); }
function authHeaders() { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }

function apiSett()             { return `${API_URL}/allenamenti/${allenamentoID}/settimane/`; }
function apiNota(sett)         { return `${API_URL}/allenamenti/${allenamentoID}/settimane/${sett}/nota/`; }
function apiIniz(sett)         { return `${API_URL}/allenamenti/${allenamentoID}/settimane/${sett}/sedute/1/inizializza`; }
function apiDelSett(sett)      { return `${API_URL}/allenamenti/${allenamentoID}/settimane/${sett}/`; }

// ── INIT ───────────────────────────────────────────────────────────────────
async function init() {
  document.getElementById("atletaName").textContent = atNome;
  document.getElementById("backBtn").onclick = () => {
    const q = new URLSearchParams({ atleta: atID, nome: params.get("nome") || "", cognome: params.get("cognome") || "" });
    window.location.href = "Allenamenti.html?" + q.toString();
  };
  await renderSettimane();
}

// ── TABELLA SETTIMANE ──────────────────────────────────────────────────────
async function renderSettimane() {
  const tbody = document.getElementById("settimaneBody");
  tbody.innerHTML = "";

  let settimane = [];
  try {
    const res = await fetch(apiSett(), { headers: authHeaders() });
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
        <input class="sett-obj" type="text" value="${escHtml(s.obiettivo || "")}"
          placeholder="Obiettivo settimana..."
          onblur="saveRow(this.closest('tr'))"
          onkeydown="if(event.key==='Enter'){ saveRow(this.closest('tr')); nextEmptyRow(); }">
      </td>
      <td class="td-actions">
        <button class="sett-btn sett-btn-det" onclick="apriDettagliSettimana(${s.IDsettimana})" title="Dettagli Seduta">📋</button>
        <button class="sett-btn sett-btn-del" onclick="eliminaSettimana(${s.IDsettimana})" title="Elimina">✕</button>
      </td>`;
    tbody.appendChild(tr);
  });

  addEmptyInputRow(tbody);
}

function addEmptyInputRow(tbody) {
  const tr = document.createElement("tr");
  tr.className = "empty-input-row";
  tr.innerHTML = `
    <td class="td-num">
      <input class="sett-num" type="number" placeholder="N°"
        onblur="checkNewRow(this.closest('tr'))">
    </td>
    <td>
      <input class="sett-obj" type="text" placeholder=""
        onblur="checkNewRow(this.closest('tr'))"
        onkeydown="if(event.key==='Enter') checkNewRow(this.closest('tr'))">
    </td>
    <td class="td-actions">
      <button class="sett-btn sett-btn-det" disabled>📋</button>
      <button class="sett-btn sett-btn-del" disabled>✕</button>
    </td>`;
  tbody.appendChild(tr);
}

async function checkNewRow(tr) {
  const numVal = tr.querySelector(".sett-num").value.trim();
  const objVal = tr.querySelector(".sett-obj").value.trim();
  if (!numVal) return;
  const numSett = parseInt(numVal);
  if (!numSett || numSett < 1) return;
  try {
    await fetch(apiIniz(numSett), { method: "POST", headers: authHeaders() });
    if (objVal) {
      await fetch(apiNota(numSett), {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ nota: JSON.stringify({ obiettivo: objVal }) }),
      });
    }
  } catch {}
  renderSettimane();
}

async function saveRow(tr) {
  const numSett = Number(tr.dataset.sett);
  if (!numSett) return;
  const objVal = tr.querySelector(".sett-obj").value.trim();
  try {
    let existing = {};
    const r = await fetch(apiNota(numSett), { headers: authHeaders() });
    if (r.ok) {
      const row = await r.json();
      if (row?.nota) { try { existing = JSON.parse(row.nota); } catch {} }
    }
    existing.obiettivo = objVal;
    await fetch(apiNota(numSett), {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ nota: JSON.stringify(existing) }),
    });
  } catch {}
}

function apriDettagliSettimana(numSett) {
  const q = new URLSearchParams({
    allenamento: allenamentoID,
    atleta:      atID,
    nome:        params.get("nome")    || "",
    cognome:     params.get("cognome") || "",
    inizio:      params.get("inizio")  || "",
    fine:        params.get("fine")    || "",
    settimana:   numSett,
    seduta:      1,
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

async function eliminaSettimana(numSett) {
  try {
    await fetch(apiDelSett(numSett), { method: "DELETE", headers: authHeaders() });
  } catch {}
  renderSettimane();
}

function nextEmptyRow() {
  const empty = document.querySelector(".empty-input-row .sett-obj");
  if (empty) empty.focus();
}

function escHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
}

init();
