const params  = new URLSearchParams(location.search);
const atID    = params.get("id")   || "";
const atNome  = decodeURIComponent(params.get("nome") || "Atleta");
const KEY     = "arcieri_piani_" + atID;

let piani      = [];
let currentIdx = 0;

// ── STORAGE ────────────────────────────────────────────────────────────────
function loadPiani()  { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
function storePiani() { localStorage.setItem(KEY, JSON.stringify(piani)); }
function pianoVuoto() { return { id: Date.now(), dataInizio: "", dataFine: "", obiettivi: "", settimane: [] }; }

// ── INIT ───────────────────────────────────────────────────────────────────
function init() {
  document.getElementById("atletaName").textContent = atNome;
  piani = loadPiani();
  if (piani.length === 0) { piani.push(pianoVuoto()); storePiani(); }
  currentIdx = piani.length - 1;
  renderCurrent();
}

// ── RENDER ─────────────────────────────────────────────────────────────────
function renderCurrent() {
  const p = piani[currentIdx];
  document.getElementById("navCounter").textContent  = `${currentIdx + 1} / ${piani.length}`;
  document.getElementById("dataInizio").value  = p.dataInizio || "";
  document.getElementById("dataFine").value    = p.dataFine   || "";
  document.getElementById("obiettivi").value   = p.obiettivi  || "";
  renderSettimane();
  updateNavBtns();
}

function updateNavBtns() {
  document.getElementById("btnPrecedente").disabled = currentIdx <= 0;
  document.getElementById("btnSuccessivo").disabled = currentIdx >= piani.length - 1;
  document.getElementById("btnUltimo").disabled     = currentIdx >= piani.length - 1;
}

// ── TABELLA SETTIMANE (righe sempre editabili) ─────────────────────────────
function renderSettimane() {
  const tbody = document.getElementById("settimaneBody");
  const sett  = piani[currentIdx].settimane;
  tbody.innerHTML = "";

  // Righe esistenti — direttamente editabili
  sett.forEach((s, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-num">
        <input class="sett-num" type="number" value="${s.numero || ""}"
          placeholder="N°"
          onblur="saveRow(${i}, this.closest('tr'))">
      </td>
      <td>
        <input class="sett-obj" type="text" value="${escHtml(s.obiettivo || "")}"
          placeholder="Obiettivo settimana..."
          onblur="saveRow(${i}, this.closest('tr'))"
          onkeydown="if(event.key==='Enter'){ saveRow(${i}, this.closest('tr')); nextEmptyRow(); }">
      </td>
      <td class="td-actions">
        <button class="sett-btn sett-btn-det" onclick="apriDettagliSettimana(${i})" title="Dettagli Seduta">📋</button>
        <button class="sett-btn sett-btn-del" onclick="eliminaSettimana(${i})" title="Elimina">✕</button>
      </td>`;
    tbody.appendChild(tr);
  });

  // Righe vuote in fondo (sempre 3 visibili per aggiungere)
  for (let j = 0; j < 3; j++) {
    const tr = document.createElement("tr");
    tr.className = "empty-input-row";
    tr.innerHTML = `
      <td class="td-num">
        <input class="sett-num" type="number" placeholder=""
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
}

// Quando l'utente lascia una riga vuota con dati → salva automaticamente
function checkNewRow(tr) {
  const numVal = tr.querySelector(".sett-num").value.trim();
  const objVal = tr.querySelector(".sett-obj").value.trim();
  if (!numVal && !objVal) return;
  piani[currentIdx].settimane.push({
    numero:    parseInt(numVal) || null,
    obiettivo: objVal
  });
  autoSave();
  renderSettimane();
}

// Salva riga esistente (aggiorna valori in memoria al blur)
function saveRow(idx, tr) {
  const numVal = tr.querySelector(".sett-num").value.trim();
  const objVal = tr.querySelector(".sett-obj").value.trim();
  piani[currentIdx].settimane[idx] = {
    numero:    parseInt(numVal) || null,
    obiettivo: objVal
  };
  autoSave();
}

function apriDettagliSettimana(settIdx) {
  autoSave();
  const piano    = piani[currentIdx];
  const settimana = piano.settimane[settIdx];
  const numSett  = settimana?.numero || settIdx + 1;
  window.location.href = `Prog.settimana%20di%20allenamento.html?pianoId=${piano.id}&atletaId=${atID}&atletaNome=${encodeURIComponent(atNome)}&settimana=${numSett}&mode=view`;
}

function eliminaSettimana(idx) {
  piani[currentIdx].settimane.splice(idx, 1);
  autoSave();
  renderSettimane();
}

function nextEmptyRow() {
  const empty = document.querySelector(".empty-input-row .sett-obj");
  if (empty) empty.focus();
}

// ── NAVIGAZIONE ─────────────────────────────────────────────────────────────
function navPrecedente() { autoSave(); if (currentIdx > 0) { currentIdx--; renderCurrent(); } }
function navSuccessivo() { autoSave(); if (currentIdx < piani.length - 1) { currentIdx++; renderCurrent(); } }
function navUltimo()     { autoSave(); currentIdx = piani.length - 1; renderCurrent(); }

function eliminaAllenamento() {
  const label = piani[currentIdx].dataInizio ? ` del ${fmtDate(piani[currentIdx].dataInizio)}` : "";
  if (piani.length === 1) {
    if (!confirm("Eliminare questo allenamento?")) return;
    piani = [pianoVuoto()]; currentIdx = 0;
  } else {
    if (!confirm(`Eliminare l'allenamento${label}?`)) return;
    piani.splice(currentIdx, 1);
    currentIdx = Math.min(currentIdx, piani.length - 1);
  }
  storePiani(); renderCurrent();
}

function nuovoAllenamento() {
  autoSave();
  piani.push(pianoVuoto());
  storePiani();
  currentIdx = piani.length - 1;
  renderCurrent();
}

// ── DETTAGLI SEDUTA / ELIMINA SEDUTA ───────────────────────────────────────
function apriDettagliSeduta() {
  autoSave();
  const pianoId = piani[currentIdx].id;
  window.location.href = `Prog.settimana%20di%20allenamento.html?pianoId=${pianoId}&atletaId=${atID}&atletaNome=${encodeURIComponent(atNome)}&mode=view`;
}

function eliminaSeduta() {
  if (!confirm("Sei sicuro di voler eliminare questa seduta?")) return;
  alert("Funzione di eliminazione seduta");
}

// ── AUTO-SAVE ──────────────────────────────────────────────────────────────
function autoSave() {
  const p = piani[currentIdx];
  p.dataInizio = document.getElementById("dataInizio").value;
  p.dataFine   = document.getElementById("dataFine").value;
  p.obiettivi  = document.getElementById("obiettivi").value;
  storePiani();
}

function fmtDate(d) {
  if (!d) return "";
  const [y, m, g] = d.split("-");
  return `${g}/${m}/${y}`;
}
function escHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
}

init();
