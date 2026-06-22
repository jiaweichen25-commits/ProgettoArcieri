const API_URL = "http://localhost:8000";
const params = new URLSearchParams(location.search);

const ID_ALLENAMENTO = Number(params.get("allenamento"));
const ID_ATLETA      = Number(params.get("atleta"));
const NOME_ATLETA    = params.get("nome")    || "";
const COGNOME_ATLETA = params.get("cognome") || "";
const DATA_INIZIO    = params.get("inizio")  || "";
const DATA_FINE      = params.get("fine")    || "";
const NUM_SETTIMANA  = Number(params.get("settimana")) || 1;
const NUM_SEDUTA     = Number(params.get("seduta"))    || 1;

// Lookup tables
let luRiscaldamento   = [];
let luDistanza        = [];
let luTarga           = [];
let luDesEsercizio    = [];
let luStretching      = [];
let luTabellaN        = [];
let luDesFisForRes    = [];
let luAttrezzi        = [];
let luDesFisCor       = [];
let luForzaEsercizi   = [];
let luForzaRipetizioni = [];
let luFcTempi         = [];

// Data model — arrays include dbId per row for normalized table tracking
let data = {
  riscaldamento: [],
  tfc: [],
  stretching: [],
  forza: [],
  coord: [],
  note: "",
  frecce: { lun: 0, mar: 0, mer: 0, gio: 0, ven: 0, sab: 0, dom: 0 },
  obiettivo: "",
};

let riscModalIdx = -1;
const GIORNI = ["lun","mar","mer","gio","ven","sab","dom"];

// ── PRESET DATA TFC ──────────────────────────────────────────────────────────

const PIEDI_PRESET = [
  "PAUSA","A Terra","Tavoletta Inclinata","Materassino","Piedi Uniti",
  "Tavoletta a Dondolo","Peso sui Talloni","Peso sulle Punte",
  "Peso su Piede Destro","Peso su Piede Sinistro","Gymball",
  "Sbilanciamento avanti/indietro","Postura Verticale",
  "Peso su gamba arco/corda","Piedi uniti/molto aperti/in Linea"
];
const SERIE_PRESET = [
  "1x3","3x1","3x2","1x6","2x3","6x1","3x3","2x6","1x12",
  "6x2","3x6","6x3","12x2","2x12","10x3","12x3","6x6","3x12","10x4","20x3","12x6"
];
let piediList = [...PIEDI_PRESET];
let serieList = [...SERIE_PRESET];

const TFR_TEMPI_DEFAULT = ["1'","2'","3'","4'","5'","6'","7'","8'","9'"];
let tfrTempiList = [...TFR_TEMPI_DEFAULT];
const TFR_TEMPI_OPTS = () => ["–", ...tfrTempiList];

// TFC active cell state
let tfcActiveRow = -1;
let tfcActiveCol = null;

// ── AUTH ─────────────────────────────────────────────────────────────────────

function getToken()    { return localStorage.getItem("access_token"); }
function authHeaders() { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }

function requireAuth() {
  const token = getToken();
  const loginUrl = "../Autenticazione/Istruttore.html";
  const redirect = () => { localStorage.clear(); window.top.location.href = loginUrl; };
  if (!token) { redirect(); return false; }
  try {
    const p = JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
    if (p.ruolo !== "istruttore") { redirect(); return false; }
    if (p.exp && Date.now() / 1000 > p.exp) { redirect(); return false; }
    return true;
  } catch { redirect(); return false; }
}

// ── API ENDPOINTS ─────────────────────────────────────────────────────────────

const API_BASE_SEDUTA = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${NUM_SETTIMANA}/sedute/${NUM_SEDUTA}`;
const API_RISC        = `${API_BASE_SEDUTA}/riscaldamento/`;
const API_STR         = `${API_BASE_SEDUTA}/stretching/`;
const API_TFC         = `${API_BASE_SEDUTA}/tecforcor/`;
const API_FORZA       = `${API_BASE_SEDUTA}/allfisforres/`;
const API_COORD       = `${API_BASE_SEDUTA}/allfiscor/`;
const API_INIZIALIZZA = `${API_BASE_SEDUTA}/inizializza`;
const API_NOTA        = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${NUM_SETTIMANA}/nota/`;

// ── DB LOAD ───────────────────────────────────────────────────────────────────

async function loadFromDb() {
  try { await fetch(API_INIZIALIZZA, { method: "POST", headers: authHeaders() }); } catch {}

  // Scalar fields from nota
  try {
    const res = await fetch(API_NOTA, { headers: authHeaders() });
    if (res.ok) {
      const row = await res.json();
      if (row?.nota) {
        try {
          const parsed = JSON.parse(row.nota);
          data.obiettivo = parsed.obiettivo || "";
          data.note      = parsed.note      || "";
          data.frecce    = parsed.frecce    || { lun:0, mar:0, mer:0, gio:0, ven:0, sab:0, dom:0 };
        } catch {}
      }
    }
  } catch {}

  // Normalized sections — load in parallel
  await Promise.all([
    (async () => {
      try {
        const res = await fetch(API_RISC, { headers: authHeaders() });
        if (res.ok) {
          data.riscaldamento = (await res.json()).map(r => ({
            dbId: r.IDdetRiscaldamento,
            esercizioId: r.id_esercizio_riscaldamento,
            giorni: { lun: r.lunedi||"", mar: r.martedi||"", mer: r.mercoledi||"", gio: r.giovedi||"", ven: r.venerdi||"", sab: r.sabato||"", dom: r.domenica||"" },
          }));
        }
      } catch {}
    })(),
    (async () => {
      try {
        const res = await fetch(API_STR, { headers: authHeaders() });
        if (res.ok) {
          data.stretching = (await res.json()).map(r => ({
            dbId: r.IDdetStretching,
            lun: r.lunedi    ? (parseInt(r.lunedi)    || null) : null,
            mar: r.martedi   ? (parseInt(r.martedi)   || null) : null,
            mer: r.mercoledi ? (parseInt(r.mercoledi) || null) : null,
            gio: r.giovedi   ? (parseInt(r.giovedi)   || null) : null,
            ven: r.venerdi   ? (parseInt(r.venerdi)   || null) : null,
            sab: r.sabato    ? (parseInt(r.sabato)    || null) : null,
            dom: r.domenica  ? (parseInt(r.domenica)  || null) : null,
          }));
        }
      } catch {}
    })(),
    (async () => {
      try {
        const res = await fetch(API_TFC, { headers: authHeaders() });
        if (res.ok) {
          data.tfc = (await res.json()).map(r => ({
            dbId: r.IDdetTecForCor,
            posizionePiedi: r.posizione_piedi || "",
            distanzaId: r.id_distanza,
            targaId:    r.id_targa,
            desId:      r.id_descrizione_esercizio,
            giorni: { lun: r.lunedi||"", mar: r.martedi||"", mer: r.mercoledi||"", gio: r.giovedi||"", ven: r.venerdi||"", sab: r.sabato||"", dom: r.domenica||"" },
          }));
        }
      } catch {}
    })(),
    (async () => {
      try {
        const res = await fetch(API_FORZA, { headers: authHeaders() });
        if (res.ok) {
          data.forza = (await res.json()).map(r => ({
            dbId: r.IDdetAllFisForRes,
            tabellaKey:    r.id_tabella_n ? `es_${r.id_tabella_n}` : null,
            ripetizioneId: r.id_descrizione_esercizio_all_fis_for_res ? String(r.id_descrizione_esercizio_all_fis_for_res) : null,
            giorni: { lun: r.lunedi||"", mar: r.martedi||"", mer: r.mercoledi||"", gio: r.giovedi||"", ven: r.venerdi||"", sab: r.sabato||"", dom: r.domenica||"" },
          }));
        }
      } catch {}
    })(),
    (async () => {
      try {
        const res = await fetch(API_COORD, { headers: authHeaders() });
        if (res.ok) {
          data.coord = (await res.json()).map(r => ({
            dbId: r.IDdetAllFisCor,
            atrezzoId: r.id_attrezzo,
            desId:     r.id_descrizione_esercizio_all_fis_cor,
            giorni: { lun: r.lunedi||"", mar: r.martedi||"", mer: r.mercoledi||"", gio: r.giovedi||"", ven: r.venerdi||"", sab: r.sabato||"", dom: r.domenica||"" },
          }));
        }
      } catch {}
    })(),
  ]);
}

// ── SECTION SYNC ──────────────────────────────────────────────────────────────

const _sectionTimers = {};
function scheduleSync(key, fn) {
  clearTimeout(_sectionTimers[key]);
  _sectionTimers[key] = setTimeout(fn, 800);
}

function riscHasData(row)  { return row.esercizioId || Object.values(row.giorni || {}).some(v => v); }
function strHasData(row)   { return GIORNI.some(g => row[g]); }
function tfcHasData(row)   { return row.posizionePiedi || row.distanzaId || row.targaId || row.desId || Object.values(row.giorni || {}).some(v => v); }
function forzaHasData(row) { return row.tabellaKey || row.ripetizioneId || Object.values(row.giorni || {}).some(v => v); }
function coordHasData(row) { return row.atrezzoId || row.desId || Object.values(row.giorni || {}).some(v => v); }

async function syncRisc() {
  for (let i = 0; i < data.riscaldamento.length; i++) {
    const row = data.riscaldamento[i];
    if (!row.dbId && !riscHasData(row)) continue;
    const body = {
      id_esercizio_riscaldamento: row.esercizioId || null,
      lunedi:    row.giorni?.lun || null,
      martedi:   row.giorni?.mar || null,
      mercoledi: row.giorni?.mer || null,
      giovedi:   row.giorni?.gio || null,
      venerdi:   row.giorni?.ven || null,
      sabato:    row.giorni?.sab || null,
      domenica:  row.giorni?.dom || null,
    };
    try {
      if (row.dbId) {
        await fetch(`${API_RISC}${row.dbId}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) });
      } else {
        const res = await fetch(API_RISC, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { const d = await res.json(); data.riscaldamento[i].dbId = d.IDdetRiscaldamento; }
      }
    } catch {}
  }
}

async function syncStr() {
  for (let i = 0; i < data.stretching.length; i++) {
    const row = data.stretching[i];
    if (!row.dbId && !strHasData(row)) continue;
    const body = {
      id_esercizio_stretching: null,
      lunedi:    row.lun ? String(row.lun) : null,
      martedi:   row.mar ? String(row.mar) : null,
      mercoledi: row.mer ? String(row.mer) : null,
      giovedi:   row.gio ? String(row.gio) : null,
      venerdi:   row.ven ? String(row.ven) : null,
      sabato:    row.sab ? String(row.sab) : null,
      domenica:  row.dom ? String(row.dom) : null,
    };
    try {
      if (row.dbId) {
        await fetch(`${API_STR}${row.dbId}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) });
      } else {
        const res = await fetch(API_STR, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { const d = await res.json(); data.stretching[i].dbId = d.IDdetStretching; }
      }
    } catch {}
  }
}

async function syncTfc() {
  for (let i = 0; i < data.tfc.length; i++) {
    const row = data.tfc[i];
    if (!row.dbId && !tfcHasData(row)) continue;
    const body = {
      posizione_piedi:          row.posizionePiedi || null,
      id_distanza:              row.distanzaId ? Number(row.distanzaId) : null,
      id_targa:                 row.targaId    ? Number(row.targaId)    : null,
      id_descrizione_esercizio: row.desId      ? Number(row.desId)      : null,
      lunedi:    row.giorni?.lun || null,
      martedi:   row.giorni?.mar || null,
      mercoledi: row.giorni?.mer || null,
      giovedi:   row.giorni?.gio || null,
      venerdi:   row.giorni?.ven || null,
      sabato:    row.giorni?.sab || null,
      domenica:  row.giorni?.dom || null,
    };
    try {
      if (row.dbId) {
        await fetch(`${API_TFC}${row.dbId}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) });
      } else {
        const res = await fetch(API_TFC, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { const d = await res.json(); data.tfc[i].dbId = d.IDdetTecForCor; }
      }
    } catch {}
  }
}

async function syncForza() {
  for (let i = 0; i < data.forza.length; i++) {
    const row = data.forza[i];
    if (!row.dbId && !forzaHasData(row)) continue;
    const tabellaId     = row.tabellaKey    ? parseInt(String(row.tabellaKey).replace("es_","")) || null : null;
    const ripetizioneId = row.ripetizioneId ? Number(row.ripetizioneId) : null;
    const body = {
      id_tabella_n: tabellaId,
      id_descrizione_esercizio_all_fis_for_res: ripetizioneId,
      lunedi:    row.giorni?.lun || null,
      martedi:   row.giorni?.mar || null,
      mercoledi: row.giorni?.mer || null,
      giovedi:   row.giorni?.gio || null,
      venerdi:   row.giorni?.ven || null,
      sabato:    row.giorni?.sab || null,
      domenica:  row.giorni?.dom || null,
    };
    try {
      if (row.dbId) {
        await fetch(`${API_FORZA}${row.dbId}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) });
      } else {
        const res = await fetch(API_FORZA, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { const d = await res.json(); data.forza[i].dbId = d.IDdetAllFisForRes; }
      }
    } catch {}
  }
}

async function syncCoord() {
  for (let i = 0; i < data.coord.length; i++) {
    const row = data.coord[i];
    if (!row.dbId && !coordHasData(row)) continue;
    const body = {
      id_attrezzo:                         row.atrezzoId ? Number(row.atrezzoId) : null,
      id_descrizione_esercizio_all_fis_cor: row.desId    ? Number(row.desId)     : null,
      lunedi:    row.giorni?.lun || null,
      martedi:   row.giorni?.mar || null,
      mercoledi: row.giorni?.mer || null,
      giovedi:   row.giorni?.gio || null,
      venerdi:   row.giorni?.ven || null,
      sabato:    row.giorni?.sab || null,
      domenica:  row.giorni?.dom || null,
    };
    try {
      if (row.dbId) {
        await fetch(`${API_COORD}${row.dbId}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) });
      } else {
        const res = await fetch(API_COORD, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { const d = await res.json(); data.coord[i].dbId = d.IDdetAllFisCor; }
      }
    } catch {}
  }
}

// ── SCALAR SAVE (obiettivo, note, frecce only) ────────────────────────────────

let _saveTimer = null;

function autoSave() {
  data.obiettivo = document.getElementById("page-obiettivo")?.value || "";
  data.note      = document.getElementById("note-atleta")?.value  || "";
  GIORNI.forEach(g => {
    const el = document.getElementById("f_" + g);
    if (el) data.frecce[g] = Number(el.value) || 0;
  });
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(persistToDb, 800);
}

async function persistToDb() {
  try {
    await fetch(API_NOTA, {
      method:  "POST",
      headers: authHeaders(),
      body:    JSON.stringify({ nota: JSON.stringify({ obiettivo: data.obiettivo, note: data.note, frecce: data.frecce }) }),
    });
  } catch {}
}

// ── LOOKUPS ───────────────────────────────────────────────────────────────────

async function loadLookup() {
  const eps = [
    ["/allenamenti/lookup/riscaldamento-list/",       d => luRiscaldamento = d],
    ["/allenamenti/lookup/distanza-list/",            d => luDistanza      = d],
    ["/allenamenti/lookup/targa-list/",               d => luTarga         = d],
    ["/allenamenti/lookup/descrizione-esercizio-list/", d => luDesEsercizio = d],
    ["/allenamenti/lookup/stretching-list/",          d => luStretching    = d],
    ["/allenamenti/lookup/tabella-numero-list/",      d => luTabellaN      = d],
    ["/allenamenti/lookup/allfisforres-descrizione-list/", d => luDesFisForRes  = d],
    ["/allenamenti/lookup/attrezzi-list/",            d => luAttrezzi        = d],
    ["/allenamenti/lookup/allfiscor-descrizione-list/", d => luDesFisCor    = d],
    ["/allenamenti/lookup/tfr/exercises/",            d => luForzaEsercizi   = d],
    ["/allenamenti/lookup/tfr/ripetizioni/",          d => luForzaRipetizioni = d],
    ["/allenamenti/lookup/fc/tempi/",                 d => luFcTempi         = d],
  ];
  await Promise.all(eps.map(async ([url, set]) => {
    try {
      const res = await fetch(API_URL + url, { headers: authHeaders() });
      if (res.ok) set(await res.json());
    } catch {}
  }));
}

function opts(list, valKey, lblKey, selected) {
  return `<option value="">&#9660; Seleziona</option>` +
    list.map(o => `<option value="${o[valKey]}" ${String(o[valKey]) === String(selected) ? "selected" : ""}>${o[lblKey] ?? ""}</option>`).join("");
}

// ── RISCALDAMENTO DROPDOWN ────────────────────────────────────────────────────

function toggleRiscDropdown(e) {
  e.stopPropagation();
  document.getElementById("risc-dropdown-list").classList.toggle("open");
}

function renderRiscDropdown() {
  const list = document.getElementById("risc-dropdown-list");
  if (!list) return;
  list.innerHTML = "";
  luRiscaldamento.forEach(ex => {
    const div = document.createElement("div");
    div.className = "ps-risc-dropdown-item";
    div.textContent = ex.NomeEsercizio;
    div.addEventListener("click", async () => {
      const newRow = { esercizioId: ex.IDesercizioRiscaldamento, giorni: {} };
      data.riscaldamento.push(newRow);
      renderRiscaldamento();
      document.getElementById("risc-dropdown-list").classList.remove("open");
      // POST immediately so the row gets a dbId before the user edits days
      const idx = data.riscaldamento.length - 1;
      const body = {
        id_esercizio_riscaldamento: ex.IDesercizioRiscaldamento,
        lunedi: null, martedi: null, mercoledi: null, giovedi: null, venerdi: null, sabato: null, domenica: null,
      };
      try {
        const res = await fetch(API_RISC, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { const d = await res.json(); data.riscaldamento[idx].dbId = d.IDdetRiscaldamento; }
      } catch {}
    });
    list.appendChild(div);
  });
}

function renderRiscaldamento() {
  const container = document.getElementById("risc-dynamic-columns");
  if (!container) return;
  container.innerHTML = "";
  (data.riscaldamento || []).forEach((row, idx) => {
    const ex = luRiscaldamento.find(e => String(e.IDesercizioRiscaldamento) === String(row.esercizioId));
    const name = ex?.NomeEsercizio || "—";
    const div = document.createElement("div");
    div.className = "ps-risc-dynamic-col";
    div.innerHTML = `
      <span class="ps-risc-dynamic-col-name">${esc(name)}</span>
      <div class="ps-risc-dynamic-col-actions">
        <button class="ps-icon-btn" type="button" onclick="openRiscModal(${idx})" title="Dettagli giorni">&#128203;</button>
        <button class="ps-del-btn" onclick="deleteRiscRow(${idx})">&#10005;</button>
      </div>
    `;
    container.appendChild(div);
  });
}

async function deleteRiscRow(idx) {
  const row = data.riscaldamento[idx];
  if (row?.dbId) {
    try { await fetch(`${API_RISC}${row.dbId}`, { method: "DELETE", headers: authHeaders() }); } catch {}
  }
  data.riscaldamento.splice(idx, 1);
  renderRiscaldamento();
}

// ── FRECCE ────────────────────────────────────────────────────────────────────

function updateFrecce() {
  let tot = 0;
  GIORNI.forEach(g => { tot += Number(document.getElementById("f_" + g)?.value) || 0; });
  document.getElementById("totaleFrecceTxt").textContent = tot;
  autoSave();
}

function renderFrecce() {
  const f = data.frecce || {};
  GIORNI.forEach(g => {
    const el = document.getElementById("f_" + g);
    if (el) el.value = f[g] || 0;
  });
  updateFrecce();
}

function calcolaFrecceTFC() {
  const totals = { lun:0, mar:0, mer:0, gio:0, ven:0, sab:0, dom:0 };
  (data.tfc || []).forEach(row => {
    GIORNI.forEach(g => {
      const v = (row.giorni?.[g] || "").toString().trim();
      const parts = v.split("x");
      if (parts.length === 2) {
        totals[g] += (Number(parts[0]) || 0) * (Number(parts[1]) || 0);
      }
    });
  });
  GIORNI.forEach(g => {
    const el = document.getElementById("f_" + g);
    if (el) el.value = totals[g];
  });
  updateFrecce();
}

function updateRisc(idx, key, val) {
  if (!data.riscaldamento[idx]) return;
  data.riscaldamento[idx][key] = val || null;
  scheduleSync("risc", syncRisc);
}

function openRiscModal(idx) {
  riscModalIdx = idx;
  const g = data.riscaldamento[idx]?.giorni || {};
  GIORNI.forEach(d => {
    const el = document.getElementById("rm_" + d);
    if (el) el.value = g[d] || "";
  });
  document.getElementById("riscModal").classList.add("open");
}

function closeRiscModal() {
  document.getElementById("riscModal").classList.remove("open");
  riscModalIdx = -1;
}

function saveRiscModal() {
  if (riscModalIdx < 0 || !data.riscaldamento[riscModalIdx]) return;
  const g = {};
  GIORNI.forEach(d => { g[d] = document.getElementById("rm_" + d)?.value || ""; });
  data.riscaldamento[riscModalIdx].giorni = g;
  scheduleSync("risc", syncRisc);
  closeRiscModal();
}

function openRiscListModal() {
  renderRiscList();
  document.getElementById("riscListModal").classList.add("open");
}

function closeRiscListModal() {
  document.getElementById("riscListModal").classList.remove("open");
}

function renderRiscList() {
  const tbody = document.getElementById("riscListUl");
  if (!tbody) return;
  const rows = luRiscaldamento.map((item, idx) => `
    <tr>
      <td><input class="ps-risc-list-inp" type="text" value="${esc(item.NomeEsercizio || "")}"
        onchange="updateRiscExerciseName(${idx}, this.value)"/></td>
      <td class="ps-risc-list-az-col"><button class="ps-del-btn" type="button" onclick="deleteRiscExercise(${idx})">&#10005;</button></td>
    </tr>
  `).join("");
  const addRow = `
    <tr>
      <td><input class="ps-risc-list-inp ps-risc-list-inp-new" id="riscListNewInput" type="text"
        placeholder="Digita un nuovo esercizio..."
        onkeydown="if(event.key==='Enter'){ addNewRiscExercise(); }"/></td>
      <td class="ps-risc-list-az-col"><button class="ps-auto-btn" type="button" onclick="addNewRiscExercise()">Auto</button></td>
    </tr>
  `;
  tbody.innerHTML = rows + addRow;
}

function updateRiscExerciseName(idx, value) {
  if (!luRiscaldamento[idx]) return;
  luRiscaldamento[idx].NomeEsercizio = value;
  renderRiscDropdown();
  renderRiscaldamento();
}

async function addNewRiscExercise() {
  const input = document.getElementById("riscListNewInput");
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  try {
    const res = await fetch(API_URL + "/allenamenti/lookup/riscaldamento/", {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ valore: value })
    });
    if (res.ok) {
      const item = await res.json();
      luRiscaldamento.push({ IDesercizioRiscaldamento: item.IDesercizioRiscaldamento, NomeEsercizio: item.NomeEsercizio });
    }
  } catch {}
  renderRiscDropdown();
  renderRiscList();
  setTimeout(() => { const ni = document.getElementById("riscListNewInput"); if (ni) ni.focus(); }, 0);
}

async function deleteRiscExercise(index) {
  if (index < 0 || index >= luRiscaldamento.length) return;
  const item = luRiscaldamento[index];
  try {
    await fetch(API_URL + `/allenamenti/lookup/riscaldamento/${item.IDesercizioRiscaldamento}`, {
      method: "DELETE", headers: authHeaders()
    });
  } catch {}
  luRiscaldamento.splice(index, 1);
  renderRiscDropdown();
  renderRiscList();
}

// ── TECNICA - FORZA - COORDINAZIONE ──────────────────────────────────────────

function renderTfc() {
  if (!data.tfc || data.tfc.length === 0) {
    data.tfc = [{ posizionePiedi:"", distanzaId:null, targaId:null, giorni:{}, desId:null }];
  }
  const tbody = document.getElementById("tfcBody");
  tbody.innerHTML = "";

  data.tfc.forEach((row, idx) => {
    const distName = luDistanza.find(d => String(d.IDdistanza) === String(row.distanzaId))?.NomeEsercizio || "";
    const targName = luTarga.find(t => String(t.IDtarga) === String(row.targaId))?.NomeTarga || "";
    const desName  = luDesEsercizio.find(d => String(d.IDdescrizioneEsercizio) === String(row.desId))?.NomeEsercizio || "";

    const cell = (col, val) =>
      `<td><div class="ps-cell-wrap" style="cursor:pointer;" onclick="tfcCellClick(${idx},'${col}',event)">
        <input type="text" value="${esc(val)}" readonly style="cursor:pointer;pointer-events:none;"/>
        <span class="ps-inside-arrow">&#9660;</span>
      </div></td>`;

    const tr = document.createElement("tr");
    tr.innerHTML =
      cell("posizionePiedi", row.posizionePiedi || "") +
      cell("distanzaId", distName) +
      cell("targaId", targName) +
      GIORNI.map(g => {
        const raw = row.giorni?.[g] || "";
        const parts = raw.split("x");
        const display = parts.length === 2 ? String((Number(parts[0])||0)*(Number(parts[1])||0)) : raw;
        return cell(g, display);
      }).join("") +
      `<td style="text-align:center;opacity:.4;font-size:14px;">&#128203;</td>` +
      cell("desId", desName) +
      `<td style="text-align:center;"><button class="ps-del-btn" onclick="deleteTfcRow(${idx})">&#10005;</button></td>`;
    tbody.appendChild(tr);
  });
}

function addTfcRow() {
  data.tfc.push({ posizionePiedi:"", distanzaId:null, targaId:null, giorni:{}, desId:null });
  renderTfc();
}

async function deleteTfcRow(idx) {
  const row = data.tfc[idx];
  if (row?.dbId) {
    try { await fetch(`${API_TFC}${row.dbId}`, { method: "DELETE", headers: authHeaders() }); } catch {}
  }
  data.tfc.splice(idx, 1);
  if (data.tfc.length === 0) data.tfc.push({ posizionePiedi:"", distanzaId:null, targaId:null, giorni:{}, desId:null });
  renderTfc();
}

function updateTfcField(idx, key, val) {
  if (!data.tfc[idx]) return;
  data.tfc[idx][key] = val || null;
  scheduleSync("tfc", syncTfc);
}

function updateTfcGiorno(idx, g, val) {
  if (!data.tfc[idx]) return;
  if (!data.tfc[idx].giorni) data.tfc[idx].giorni = {};
  data.tfc[idx].giorni[g] = val;
  scheduleSync("tfc", syncTfc);
}

// ── TFC MODAL SYSTEM ─────────────────────────────────────────────────────────

const TFC_MODAL_IDS = [
  "tfc-piedi-modal","tfc-distanza-modal","tfc-targa-modal",
  "tfc-serie-modal","tfc-descrizione-modal"
];

function openTfcModal(id) {
  TFC_MODAL_IDS.forEach(m => document.getElementById(m)?.classList.remove("open"));
  document.getElementById(id)?.classList.add("open");
}

function closeTfcAllModals() {
  TFC_MODAL_IDS.forEach(id => document.getElementById(id)?.classList.remove("open"));
}

function tfcCellClick(idx, col, e) {
  e.stopPropagation();
  tfcActiveRow = idx;
  tfcActiveCol = col;
  if (col === "posizionePiedi") {
    renderTfcPiediList(true);
    openTfcModal("tfc-piedi-modal");
  } else if (col === "distanzaId") {
    renderTfcDistanzaList(true);
    openTfcModal("tfc-distanza-modal");
  } else if (col === "targaId") {
    renderTfcTargaList(true);
    openTfcModal("tfc-targa-modal");
  } else if (col === "desId") {
    renderTfcDescrizioneList(true);
    openTfcModal("tfc-descrizione-modal");
  } else {
    renderTfcSerieList(true);
    openTfcModal("tfc-serie-modal");
  }
}

function selectTfcVal(value) {
  if (tfcActiveRow < 0 || !tfcActiveCol) { closeTfcAllModals(); return; }
  const idx = tfcActiveRow;
  const col = tfcActiveCol;
  if (GIORNI.includes(col)) {
    updateTfcGiorno(idx, col, value);
    calcolaFrecceTFC();
  } else {
    updateTfcField(idx, col, value);
  }
  if (idx === data.tfc.length - 1) {
    data.tfc.push({ posizionePiedi:"", distanzaId:null, targaId:null, giorni:{}, desId:null });
  }
  closeTfcAllModals();
  renderTfc();
}

// selectionMode=true: clicking an item sets value. false: management only.
function renderTfcPiediList(selectionMode) {
  const container = document.getElementById("tfc-modal-piedi-list");
  if (!container) return;
  container.innerHTML = piediList.map((p, i) => `
    <div class="modal-exercise-row">
      <input type="text" value="${esc(p)}" readonly data-v="${esc(p)}"
        ${selectionMode ? 'onclick="selectTfcVal(this.dataset.v)"' : ""}
        style="cursor:${selectionMode ? "pointer" : "default"};"/>
      <button class="delete-btn" onclick="deletePiediItem(${i},${selectionMode})">×</button>
    </div>`).join("");
}

function renderTfcDistanzaList(selectionMode) {
  const container = document.getElementById("tfc-modal-distanza-list");
  if (!container) return;
  container.innerHTML = luDistanza.map(d => {
    const id  = String(d.IDdistanza);
    const lbl = d.NomeEsercizio || id;
    return `<div class="modal-exercise-row">
      <input type="text" value="${esc(lbl)}" readonly data-v="${esc(id)}"
        ${selectionMode ? 'onclick="selectTfcVal(this.dataset.v)"' : ""}
        style="cursor:${selectionMode ? "pointer" : "default"};"/>
      <button class="delete-btn" style="opacity:.3;cursor:default;">×</button>
    </div>`;
  }).join("");
}

function renderTfcTargaList(selectionMode) {
  const container = document.getElementById("tfc-modal-targa-list");
  if (!container) return;
  container.innerHTML = luTarga.map(t => {
    const id  = String(t.IDtarga);
    const lbl = t.NomeTarga || id;
    return `<div class="modal-exercise-row">
      <input type="text" value="${esc(lbl)}" readonly data-v="${esc(id)}"
        ${selectionMode ? 'onclick="selectTfcVal(this.dataset.v)"' : ""}
        style="cursor:${selectionMode ? "pointer" : "default"};"/>
      <button class="delete-btn" style="opacity:.3;cursor:default;">×</button>
    </div>`;
  }).join("");
}

function renderTfcSerieList(selectionMode) {
  const container = document.getElementById("tfc-modal-serie-list");
  if (!container) return;
  container.innerHTML = serieList.map((s, i) => {
    const parts = s.split("x");
    const res = parts.length === 2 ? (Number(parts[0]) || 0) * (Number(parts[1]) || 0) : "";
    return `<div class="modal-exercise-row tfc-serie-row">
      <input type="text" value="${esc(s)}" readonly data-v="${esc(s)}"
        ${selectionMode ? 'onclick="selectTfcVal(this.dataset.v)"' : ""}
        style="cursor:${selectionMode ? "pointer" : "default"};width:50%;"/>
      <span class="tfc-serie-result">${res}</span>
      <button class="delete-btn" onclick="deleteSerieItem(${i},${selectionMode})">×</button>
    </div>`;
  }).join("");
}

function renderTfcDescrizioneList(selectionMode) {
  const container = document.getElementById("tfc-modal-descrizione-list");
  if (!container) return;
  container.innerHTML = luDesEsercizio.map(d => {
    const id  = String(d.IDdescrizioneEsercizio);
    const lbl = d.NomeEsercizio || id;
    return `<div class="modal-exercise-row">
      <input type="text" value="${esc(lbl)}" readonly data-v="${esc(id)}"
        ${selectionMode ? 'onclick="selectTfcVal(this.dataset.v)"' : ""}
        style="cursor:${selectionMode ? "pointer" : "default"};"/>
      <button class="delete-btn" style="opacity:.3;cursor:default;">×</button>
    </div>`;
  }).join("");
}

function deletePiediItem(i, selectionMode) {
  piediList.splice(i, 1);
  renderTfcPiediList(selectionMode);
}

function deleteSerieItem(i, selectionMode) {
  serieList.splice(i, 1);
  renderTfcSerieList(selectionMode);
}

function addTfcPiediItem() {
  const input = document.getElementById("tfc-new-piedi-input");
  const val = input?.value.trim();
  if (!val) return;
  piediList.push(val);
  if (input) input.value = "";
  renderTfcPiediList(tfcActiveRow >= 0);
}

async function addTfcDistanzaItem() {
  const input = document.getElementById("tfc-new-distanza-input");
  const val = input?.value.trim();
  if (!val) return;
  try {
    const res = await fetch(API_URL + "/allenamenti/lookup/tfc/distanza/", {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ valore: val })
    });
    if (res.ok) {
      const item = await res.json();
      luDistanza.push({ IDdistanza: item.id, NomeEsercizio: item.valore });
    }
  } catch {}
  if (input) input.value = "";
  renderTfcDistanzaList(tfcActiveRow >= 0);
}

async function addTfcTargaItem() {
  const input = document.getElementById("tfc-new-targa-input");
  const val = input?.value.trim();
  if (!val) return;
  try {
    const res = await fetch(API_URL + "/allenamenti/lookup/tfc/targa/", {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ valore: val })
    });
    if (res.ok) {
      const item = await res.json();
      luTarga.push({ IDtarga: item.id, NomeTarga: item.valore });
    }
  } catch {}
  if (input) input.value = "";
  renderTfcTargaList(tfcActiveRow >= 0);
}

function addTfcSerieItem() {
  const input = document.getElementById("tfc-new-serie-input");
  const val = input?.value.trim();
  if (!val) return;
  serieList.push(val);
  if (input) input.value = "";
  renderTfcSerieList(tfcActiveRow >= 0);
}

async function addTfcDescrizioneItem() {
  const input = document.getElementById("tfc-new-descrizione-input");
  const val = input?.value.trim();
  if (!val) return;
  try {
    const res = await fetch(API_URL + "/allenamenti/lookup/tfc/descrizione/", {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ valore: val })
    });
    if (res.ok) {
      const item = await res.json();
      luDesEsercizio.push({ IDdescrizioneEsercizio: item.id, NomeEsercizio: item.valore });
    }
  } catch {}
  if (input) input.value = "";
  renderTfcDescrizioneList(tfcActiveRow >= 0);
}

// ── STRETCHING ────────────────────────────────────────────────────────────────

function renderStretching() {
  if (!data.stretching || data.stretching.length === 0) {
    data.stretching = [{ lun:null, mar:null, mer:null, gio:null, ven:null, sab:null, dom:null }];
  }
  const wrapper = document.getElementById("str-rows-wrapper");
  if (!wrapper) return;
  wrapper.innerHTML = "";
  data.stretching.forEach((row, idx) => {
    const div = document.createElement("div");
    div.className = "stretching-row";
    div.innerHTML = `
      <div class="slots-container">
        ${GIORNI.map(g => `<div class="select-slot">
          <select class="custom-select" onchange="updateStrGiorno(${idx},'${g}',this.value)">
            ${opts(luStretching,"IDesercizioStretching","NomeEsercizio",row[g])}
          </select>
        </div>`).join("")}
      </div>
      <div class="action-section">
        <button class="btn-delete-main" onclick="deleteStrRow(${idx})">&#10005;</button>
      </div>`;
    wrapper.appendChild(div);
  });
}

function addStretchingRow() {
  data.stretching.push({ lun:null, mar:null, mer:null, gio:null, ven:null, sab:null, dom:null });
  renderStretching();
}

async function deleteStrRow(idx) {
  const row = data.stretching[idx];
  if (row?.dbId) {
    try { await fetch(`${API_STR}${row.dbId}`, { method: "DELETE", headers: authHeaders() }); } catch {}
  }
  data.stretching.splice(idx, 1);
  if (data.stretching.length === 0) data.stretching.push({ lun:null, mar:null, mer:null, gio:null, ven:null, sab:null, dom:null });
  renderStretching();
}

function updateStrGiorno(idx, g, val) {
  if (!data.stretching[idx]) return;
  data.stretching[idx][g] = val || null;
  scheduleSync("str", syncStr);
  if (idx === data.stretching.length - 1 && val) {
    data.stretching.push({ lun:null, mar:null, mer:null, gio:null, ven:null, sab:null, dom:null });
    renderStretching();
  }
}

// ── STRETCHING MODAL (tempi) ──────────────────────────────────────────────────

function openStrModal() {
  renderStrTempiList();
  document.getElementById("str-modal-overlay")?.classList.add("active");
}

function closeStrModal() {
  document.getElementById("str-modal-overlay")?.classList.remove("active");
}

function renderStrTempiList() {
  const tbody = document.getElementById("str-table-body");
  if (!tbody) return;
  tbody.innerHTML = luStretching.map((item, idx) => `
    <tr>
      <td>${esc(item.NomeEsercizio || "")}</td>
      <td class="str-cell-action">
        <button class="str-btn-delete-row" type="button" onclick="deleteStrTempi(${idx})">×</button>
      </td>
    </tr>`).join("");
}

async function deleteStrTempi(idx) {
  const item = luStretching[idx];
  if (!item) return;
  try {
    await fetch(API_URL + `/allenamenti/lookup/stretching/${item.IDesercizioStretching}`, {
      method: "DELETE", headers: authHeaders()
    });
  } catch {}
  luStretching.splice(idx, 1);
  renderStrTempiList();
  renderStretching();
}

async function addStrNewTime(value) {
  if (!value.trim()) return;
  try {
    const res = await fetch(API_URL + "/allenamenti/lookup/stretching/", {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ valore: value.trim() })
    });
    if (res.ok) {
      const item = await res.json();
      luStretching.push({ IDesercizioStretching: item.IDesercizioStretching, NomeEsercizio: item.NomeEsercizio });
    }
  } catch {}
  renderStrTempiList();
  renderStretching();
}

// ── FORZA RESISTENZA ──────────────────────────────────────────────────────────

function forzaTabellaOpts(selected) {
  return `<option value="">&#9660; Esercizio</option>` +
    luForzaEsercizi.map(x =>
      `<option value="es_${x.id}" ${selected === "es_"+x.id ? "selected":""}>` +
      `${esc(x.valore)}</option>`
    ).join("");
}

function forzaTempiOpts(selected) {
  return TFR_TEMPI_OPTS().map(t =>
    `<option value="${esc(t)}" ${t === (selected||"–") ? "selected" : ""}>${esc(t)}</option>`
  ).join("");
}

function renderForza() {
  if (!data.forza || data.forza.length === 0) { data.forza = [{ tabellaKey: null, giorni: {}, ripetizioneId: null }]; }
  const tbody = document.getElementById("forzaBody");
  tbody.innerHTML = "";
  data.forza.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <select class="ps-sel" onchange="updateForzaField(${idx},'tabellaKey',this.value)">
          ${forzaTabellaOpts(row.tabellaKey)}
        </select>
      </td>
      ${GIORNI.map(g => `<td>
        <select class="ps-sel" onchange="updateForzaGiorno(${idx},'${g}',this.value)">
          ${forzaTempiOpts(row.giorni?.[g])}
        </select>
      </td>`).join("")}
      <td style="text-align:center;">
        <button class="icon-btn-modal" type="button" onclick="openTfrTempiModal()" style="font-size:13px;">&#128203;</button>
      </td>
      <td>
        <select class="ps-sel" style="min-width:140px;" onchange="updateForzaField(${idx},'ripetizioneId',this.value)">
          ${opts(luForzaRipetizioni,"id","valore",row.ripetizioneId)}
        </select>
      </td>
      <td style="text-align:center;"><button class="ps-del-btn" onclick="deleteForzaRow(${idx})">&#10005;</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function addForzaRow() {
  data.forza.push({ tabellaKey: null, giorni: {}, ripetizioneId: null });
  renderForza();
}

async function deleteForzaRow(idx) {
  const row = data.forza[idx];
  if (row?.dbId) {
    try { await fetch(`${API_FORZA}${row.dbId}`, { method: "DELETE", headers: authHeaders() }); } catch {}
  }
  data.forza.splice(idx, 1);
  if (data.forza.length === 0) data.forza.push({ tabellaKey: null, giorni: {}, ripetizioneId: null });
  renderForza();
}

function updateForzaField(idx, key, val) {
  if (!data.forza[idx]) return;
  data.forza[idx][key] = val || null;
  scheduleSync("forza", syncForza);
}

function updateForzaGiorno(idx, g, val) {
  if (!data.forza[idx]) return;
  if (!data.forza[idx].giorni) data.forza[idx].giorni = {};
  data.forza[idx].giorni[g] = val;
  scheduleSync("forza", syncForza);
}

// ── COORDINAZIONE ─────────────────────────────────────────────────────────────

function renderCoord() {
  if (!data.coord || data.coord.length === 0) { data.coord = [{ atrezzoId: null, giorni: {}, desId: null }]; }
  const tbody = document.getElementById("coordBody");
  tbody.innerHTML = "";
  data.coord.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><select class="ps-sel" onchange="updateCoordField(${idx},'atrezzoId',this.value)">
        ${opts(luAttrezzi,"IDattrezzo","AttrezzoDes",row.atrezzoId)}
      </select></td>
      ${GIORNI.map(g => `<td>
        <div class="ps-cell-wrap" style="cursor:pointer;" onclick="coordCellClick(${idx},'${g}',event)">
          <input type="text" value="${esc(row.giorni?.[g]||"")}" readonly style="cursor:pointer;pointer-events:none;"/>
          <span class="ps-inside-arrow">&#9660;</span>
        </div>
      </td>`).join("")}
      <td style="text-align:center;opacity:.4;font-size:14px;">&#128203;</td>
      <td><select class="ps-sel" style="min-width:160px;" onchange="updateCoordField(${idx},'desId',this.value)">
        ${opts(luDesFisCor,"IDdescrizioneEsercizioAllFisCor","DescrizioneEsercizio",row.desId)}
      </select></td>
      <td><button class="ps-del-btn" onclick="deleteCoordRow(${idx})">&#10005;</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function addCoordRow() {
  data.coord.push({ atrezzoId: null, giorni: {}, desId: null });
  renderCoord();
}

async function deleteCoordRow(idx) {
  const row = data.coord[idx];
  if (row?.dbId) {
    try { await fetch(`${API_COORD}${row.dbId}`, { method: "DELETE", headers: authHeaders() }); } catch {}
  }
  data.coord.splice(idx, 1);
  if (data.coord.length === 0) data.coord.push({ atrezzoId: null, giorni: {}, desId: null });
  renderCoord();
}

function updateCoordField(idx, key, val) {
  if (!data.coord[idx]) return;
  data.coord[idx][key] = val || null;
  scheduleSync("coord", syncCoord);
}

function updateCoordGiorno(idx, g, val) {
  if (!data.coord[idx]) return;
  if (!data.coord[idx].giorni) data.coord[idx].giorni = {};
  data.coord[idx].giorni[g] = val;
  scheduleSync("coord", syncCoord);
}

let coordActiveRow = -1;
let coordActiveGiorno = null;

function coordCellClick(idx, g, e) {
  e.stopPropagation();
  coordActiveRow = idx;
  coordActiveGiorno = g;
  renderCoordGiornoList();
  document.getElementById("coord-giorno-modal")?.classList.add("open");
}

function renderCoordGiornoList() {
  const container = document.getElementById("coord-giorno-modal-list");
  if (!container) return;
  container.innerHTML = luFcTempi.map((t, i) => `
    <div class="modal-exercise-row">
      <input type="text" value="${esc(t.valore)}" readonly data-v="${esc(t.valore)}"
        onclick="selectCoordVal(this.dataset.v)"
        style="cursor:pointer;"/>
      <button class="delete-btn" onclick="deleteCoordTempo(${i},event)">×</button>
    </div>`).join("");
}

function openCoordTempiModal() {
  renderCoordTempiList();
  document.getElementById("coord-tempi-modal")?.classList.add("open");
}

function closeCoordTempiModal() {
  document.getElementById("coord-tempi-modal")?.classList.remove("open");
}

function openCoordAtrezziModal() {
  renderCoordAtrezziList();
  document.getElementById("coord-atrezzi-modal")?.classList.add("open");
}

function closeCoordAtrezziModal() {
  document.getElementById("coord-atrezzi-modal")?.classList.remove("open");
}

function renderCoordAtrezziList() {
  const container = document.getElementById("coord-atrezzi-list");
  if (!container) return;
  container.innerHTML = luAttrezzi.map((t, i) => `
    <div class="modal-exercise-row">
      <input type="text" value="${esc(t.AttrezzoDes)}" readonly style="cursor:default;"/>
      <button class="delete-btn" onclick="deleteCoordAtrezzo(${i})">×</button>
    </div>`).join("");
}

async function addCoordAtrezzo() {
  const input = document.getElementById("coord-new-atrezzo-input");
  const val = input?.value.trim();
  if (!val) return;
  try {
    const res = await fetch(API_URL + "/allenamenti/lookup/fc/atrezzi/", {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ valore: val })
    });
    if (res.ok) {
      const item = await res.json();
      luAttrezzi.push({ IDattrezzo: item.id, AttrezzoDes: item.valore });
    }
  } catch {}
  if (input) input.value = "";
  renderCoordAtrezziList();
  renderCoord();
}

async function deleteCoordAtrezzo(idx) {
  const item = luAttrezzi[idx];
  if (!item) return;
  try {
    await fetch(API_URL + `/allenamenti/lookup/fc/atrezzi/${item.IDattrezzo}`, {
      method: "DELETE", headers: authHeaders()
    });
  } catch {}
  luAttrezzi.splice(idx, 1);
  renderCoordAtrezziList();
  renderCoord();
}

function renderCoordTempiList() {
  const container = document.getElementById("coord-tempi-list");
  if (!container) return;
  container.innerHTML = luFcTempi.map((t, i) => `
    <div class="modal-exercise-row">
      <input type="text" value="${esc(t.valore)}" readonly style="cursor:default;"/>
      <button class="delete-btn" onclick="deleteCoordTempo(${i})">×</button>
    </div>`).join("");
}

async function addCoordTempo() {
  const input = document.getElementById("coord-new-tempo-input");
  const val = input?.value.trim();
  if (!val) return;
  try {
    const res = await fetch(API_URL + "/allenamenti/lookup/fc/tempi/", {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ valore: val })
    });
    if (res.ok) {
      const item = await res.json();
      luFcTempi.push({ id: item.id, valore: item.valore });
    }
  } catch {}
  if (input) input.value = "";
  renderCoordTempiList();
}

async function deleteCoordTempo(idx, e) {
  if (e) e.stopPropagation();
  const item = luFcTempi[idx];
  if (!item) return;
  try {
    await fetch(API_URL + `/allenamenti/lookup/fc/tempi/${item.id}`, {
      method: "DELETE", headers: authHeaders()
    });
  } catch {}
  luFcTempi.splice(idx, 1);
  renderCoordTempiList();
  renderCoordGiornoList();
}

function selectCoordVal(value) {
  if (coordActiveRow < 0 || !coordActiveGiorno) { closeCoordGiornoModal(); return; }
  updateCoordGiorno(coordActiveRow, coordActiveGiorno, value);
  if (coordActiveRow === data.coord.length - 1 && value) {
    data.coord.push({ atrezzoId: null, giorni: {}, desId: null });
  }
  closeCoordGiornoModal();
  renderCoord();
}

function closeCoordGiornoModal() {
  document.getElementById("coord-giorno-modal")?.classList.remove("open");
  coordActiveRow = -1;
  coordActiveGiorno = null;
}

// ── FORZA RESISTENZA — MODAL ESERCIZI ────────────────────────────────────────

function openForzaEserciziModal()  { renderForzaEserciziList(); document.getElementById("forzaEserciziModal").classList.add("open"); }
function closeForzaEserciziModal() { document.getElementById("forzaEserciziModal").classList.remove("open"); }

function renderForzaEserciziList() {
  const tbody = document.getElementById("forzaEserciziUl");
  if (!tbody) return;
  const rows = luForzaEsercizi.map((item, idx) => `
    <tr>
      <td><input class="ps-risc-list-inp" type="text" value="${esc(item.valore||"")}" onchange="updateForzaEsercizio(${idx},this.value)"/></td>
      <td class="ps-risc-list-az-col"><button class="ps-del-btn" type="button" onclick="deleteForzaEsercizio(${idx})">&#10005;</button></td>
    </tr>`).join("");
  const addRow = `
    <tr>
      <td><input class="ps-risc-list-inp ps-risc-list-inp-new" id="forzaEserciziNewInput" type="text"
        placeholder="Digita un nuovo esercizio..."
        onkeydown="if(event.key==='Enter'){ addForzaEsercizio(); }"/></td>
      <td class="ps-risc-list-az-col"><button class="ps-auto-btn" type="button" onclick="addForzaEsercizio()">Aggiungi</button></td>
    </tr>`;
  tbody.innerHTML = rows + addRow;
}

function updateForzaEsercizio(idx, value) {
  if (!luForzaEsercizi[idx]) return;
  luForzaEsercizi[idx].valore = value;
  renderForza();
}

async function addForzaEsercizio() {
  const input = document.getElementById("forzaEserciziNewInput");
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  try {
    const res = await fetch(API_URL + "/allenamenti/lookup/tfr/exercises/", {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ valore: value })
    });
    if (res.ok) { const item = await res.json(); luForzaEsercizi.push(item); renderForza(); }
  } catch {}
  renderForzaEserciziList();
  setTimeout(() => { const ni = document.getElementById("forzaEserciziNewInput"); if (ni) ni.focus(); }, 0);
}

async function deleteForzaEsercizio(idx) {
  const item = luForzaEsercizi[idx];
  if (!item) return;
  try {
    await fetch(API_URL + `/allenamenti/lookup/tfr/exercises/${item.id}`, { method: "DELETE", headers: authHeaders() });
  } catch {}
  luForzaEsercizi.splice(idx, 1);
  renderForza();
  renderForzaEserciziList();
}

// ── FORZA RESISTENZA — MODAL RIPETIZIONI ─────────────────────────────────────

function openForzaRipetizioniModal()  { renderForzaRipetizioniList(); document.getElementById("forzaRipetizioniModal").classList.add("open"); }
function closeForzaRipetizioniModal() { document.getElementById("forzaRipetizioniModal").classList.remove("open"); }

function renderForzaRipetizioniList() {
  const tbody = document.getElementById("forzaRipetizioniUl");
  if (!tbody) return;
  const rows = luForzaRipetizioni.map((item, idx) => `
    <tr>
      <td><input class="ps-risc-list-inp" type="text" value="${esc(item.valore||"")}" onchange="updateForzaRipetizione(${idx},this.value)"/></td>
      <td class="ps-risc-list-az-col"><button class="ps-del-btn" type="button" onclick="deleteForzaRipetizione(${idx})">&#10005;</button></td>
    </tr>`).join("");
  const addRow = `
    <tr>
      <td><input class="ps-risc-list-inp ps-risc-list-inp-new" id="forzaRipetizioniNewInput" type="text"
        placeholder="Digita una nuova descrizione..."
        onkeydown="if(event.key==='Enter'){ addForzaRipetizione(); }"/></td>
      <td class="ps-risc-list-az-col"><button class="ps-auto-btn" type="button" onclick="addForzaRipetizione()">Aggiungi</button></td>
    </tr>`;
  tbody.innerHTML = rows + addRow;
}

function updateForzaRipetizione(idx, value) {
  if (!luForzaRipetizioni[idx]) return;
  luForzaRipetizioni[idx].valore = value;
  renderForza();
}

async function addForzaRipetizione() {
  const input = document.getElementById("forzaRipetizioniNewInput");
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  try {
    const res = await fetch(API_URL + "/allenamenti/lookup/tfr/ripetizioni/", {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ valore: value })
    });
    if (res.ok) { const item = await res.json(); luForzaRipetizioni.push(item); renderForza(); }
  } catch {}
  renderForzaRipetizioniList();
  setTimeout(() => { const ni = document.getElementById("forzaRipetizioniNewInput"); if (ni) ni.focus(); }, 0);
}

async function deleteForzaRipetizione(idx) {
  const item = luForzaRipetizioni[idx];
  if (!item) return;
  try {
    await fetch(API_URL + `/allenamenti/lookup/tfr/ripetizioni/${item.id}`, { method: "DELETE", headers: authHeaders() });
  } catch {}
  luForzaRipetizioni.splice(idx, 1);
  renderForza();
  renderForzaRipetizioniList();
}

// ── TFR DROPDOWN ESERCIZIO ────────────────────────────────────────────────────

function renderTfrEserciziDropdown() {
  const dd = document.getElementById("tfr-esercizi-dropdown");
  if (!dd) return;
  dd.innerHTML = "";
  luForzaEsercizi.forEach(item => {
    const div = document.createElement("div");
    div.className = "risc-dropdown-item";
    div.textContent = item.valore || "";
    div.addEventListener("click", async () => {
      const newRow = { tabellaKey: `es_${item.id}`, giorni: {}, ripetizioneId: null };
      data.forza.push(newRow);
      renderForza();
      dd.classList.remove("open");
      // POST immediately
      const idx = data.forza.length - 1;
      const body = {
        id_tabella_n: item.id,
        id_descrizione_esercizio_all_fis_for_res: null,
        lunedi: null, martedi: null, mercoledi: null, giovedi: null, venerdi: null, sabato: null, domenica: null,
      };
      try {
        const res = await fetch(API_FORZA, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { const d = await res.json(); data.forza[idx].dbId = d.IDdetAllFisForRes; }
      } catch {}
    });
    dd.appendChild(div);
  });
}

function toggleTfrEserciziDropdown(e) {
  e.stopPropagation();
  renderTfrEserciziDropdown();
  const dd = document.getElementById("tfr-esercizi-dropdown");
  dd?.classList.toggle("open");
  document.getElementById("tfr-descrizione-dropdown")?.classList.remove("open");
}

// ── TFR DROPDOWN DESCRIZIONE ──────────────────────────────────────────────────

function renderTfrDescrizioneDropdown() {
  const dd = document.getElementById("tfr-descrizione-dropdown");
  if (!dd) return;
  dd.innerHTML = "";
  luForzaRipetizioni.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "risc-dropdown-item";
    div.textContent = item.valore || "";
    div.addEventListener("click", () => {
      if (data.forza.length > 0) {
        data.forza[data.forza.length - 1].ripetizioneId = String(item.id);
        scheduleSync("forza", syncForza);
        renderForza();
      }
      dd.classList.remove("open");
    });
    dd.appendChild(div);
  });
}

function toggleTfrDescrizioneDropdown(e) {
  e.stopPropagation();
  renderTfrDescrizioneDropdown();
  const dd = document.getElementById("tfr-descrizione-dropdown");
  dd?.classList.toggle("open");
  document.getElementById("tfr-esercizi-dropdown")?.classList.remove("open");
}

// ── TFR TEMPI MODAL ───────────────────────────────────────────────────────────

function openTfrTempiModal() {
  renderTfrTempiList();
  document.getElementById("tfrTempiModal")?.classList.add("open");
}

function closeTfrTempiModal() {
  document.getElementById("tfrTempiModal")?.classList.remove("open");
}

function renderTfrTempiList() {
  const container = document.getElementById("tfr-tempi-list");
  if (!container) return;
  container.innerHTML = tfrTempiList.map((t, i) => `
    <div class="modal-exercise-row">
      <input type="text" value="${esc(t)}" readonly style="cursor:default;"/>
      <button class="delete-btn" onclick="deleteTfrTempoItem(${i})">×</button>
    </div>`).join("");
}

function deleteTfrTempoItem(i) {
  tfrTempiList.splice(i, 1);
  renderTfrTempiList();
  renderForza();
}

function addTfrTempoItem() {
  const input = document.getElementById("tfr-new-tempo-input");
  const val = input?.value.trim();
  if (!val) return;
  if (!tfrTempiList.includes(val)) tfrTempiList.push(val);
  if (input) input.value = "";
  renderTfrTempiList();
  renderForza();
}

// ── UTILS ─────────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── INIT ──────────────────────────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;

  const atleta = [NOME_ATLETA, COGNOME_ATLETA].filter(Boolean).join(" ");
  document.getElementById("page-atleta").value    = atleta || "Atleta";
  document.getElementById("page-settimana").value = NUM_SETTIMANA;

  await loadFromDb();

  document.getElementById("page-obiettivo").value = data.obiettivo || "";
  document.getElementById("note-atleta").value    = data.note      || "";

  await loadLookup();
  renderRiscDropdown();

  // ── Print ──────────────────────────────────────────────────
  document.getElementById("btn-stampa-pagina")?.addEventListener("click", () => window.print());

  // ── TFC header 📋 buttons ──────────────────────────────────
  document.getElementById("tfc-piedi-pop-btn")?.addEventListener("click", e => {
    e.stopPropagation();
    tfcActiveRow = -1; tfcActiveCol = null;
    renderTfcPiediList(false);
    document.getElementById("tfc-piedi-modal")?.classList.add("open");
  });
  document.getElementById("tfc-distanza-pop-btn")?.addEventListener("click", e => {
    e.stopPropagation();
    tfcActiveRow = -1; tfcActiveCol = null;
    renderTfcDistanzaList(false);
    document.getElementById("tfc-distanza-modal")?.classList.add("open");
  });
  document.getElementById("tfc-targa-pop-trigger")?.addEventListener("click", e => {
    e.stopPropagation();
    tfcActiveRow = -1; tfcActiveCol = null;
    renderTfcTargaList(false);
    document.getElementById("tfc-targa-modal")?.classList.add("open");
  });
  document.getElementById("tfc-serie-pop-btn")?.addEventListener("click", e => {
    e.stopPropagation();
    tfcActiveRow = -1; tfcActiveCol = null;
    renderTfcSerieList(false);
    document.getElementById("tfc-serie-modal")?.classList.add("open");
  });
  document.getElementById("tfc-descrizione-pop-btn")?.addEventListener("click", e => {
    e.stopPropagation();
    tfcActiveRow = -1; tfcActiveCol = null;
    renderTfcDescrizioneList(false);
    document.getElementById("tfc-descrizione-modal")?.classList.add("open");
  });

  // ── TFC modal close buttons ────────────────────────────────
  document.getElementById("tfc-close-piedi")?.addEventListener("click", closeTfcAllModals);
  document.getElementById("tfc-close-distanza")?.addEventListener("click", closeTfcAllModals);
  document.getElementById("tfc-close-targa")?.addEventListener("click", closeTfcAllModals);
  document.getElementById("tfc-close-serie")?.addEventListener("click", closeTfcAllModals);
  document.getElementById("tfc-close-descrizione")?.addEventListener("click", closeTfcAllModals);

  // ── TFC modal add buttons ──────────────────────────────────
  document.getElementById("tfc-add-piedi-btn")?.addEventListener("click", addTfcPiediItem);
  document.getElementById("tfc-new-piedi-input")?.addEventListener("keydown", e => { if (e.key === "Enter") addTfcPiediItem(); });
  document.getElementById("tfc-add-distanza-btn")?.addEventListener("click", addTfcDistanzaItem);
  document.getElementById("tfc-new-distanza-input")?.addEventListener("keydown", e => { if (e.key === "Enter") addTfcDistanzaItem(); });
  document.getElementById("tfc-add-targa-btn")?.addEventListener("click", addTfcTargaItem);
  document.getElementById("tfc-new-targa-input")?.addEventListener("keydown", e => { if (e.key === "Enter") addTfcTargaItem(); });
  document.getElementById("tfc-add-serie-btn")?.addEventListener("click", addTfcSerieItem);
  document.getElementById("tfc-new-serie-input")?.addEventListener("keydown", e => { if (e.key === "Enter") addTfcSerieItem(); });
  document.getElementById("tfc-add-descrizione-btn")?.addEventListener("click", addTfcDescrizioneItem);
  document.getElementById("tfc-new-descrizione-input")?.addEventListener("keydown", e => { if (e.key === "Enter") addTfcDescrizioneItem(); });

  // ── Stretching modal ──────────────────────────────────────
  document.getElementById("str-open-modal-btn")?.addEventListener("click", openStrModal);
  document.getElementById("str-close-modal-btn")?.addEventListener("click", closeStrModal);
  document.getElementById("str-new-time-input")?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      addStrNewTime(e.target.value);
      e.target.value = "";
    }
  });

  // ── TFR new tempo Enter key ───────────────────────────────
  document.getElementById("tfr-new-tempo-input")?.addEventListener("keydown", e => {
    if (e.key === "Enter") addTfrTempoItem();
  });

  // ── Coord tempi Enter key ─────────────────────────────────
  document.getElementById("coord-new-tempo-input")?.addEventListener("keydown", e => {
    if (e.key === "Enter") addCoordTempo();
  });

  // ── Close modals when clicking backdrop ───────────────────
  document.addEventListener("click", e => {
    TFC_MODAL_IDS.forEach(id => {
      const modal = document.getElementById(id);
      if (modal?.classList.contains("open") && e.target === modal) {
        closeTfcAllModals();
      }
    });
    ["riscModal","riscListModal","forzaEserciziModal","forzaRipetizioniModal","coord-giorno-modal","coord-tempi-modal","coord-atrezzi-modal"].forEach(id => {
      const modal = document.getElementById(id);
      if (modal?.classList.contains("open") && e.target === modal) {
        if (id === "coord-giorno-modal") closeCoordGiornoModal();
        else if (id === "coord-tempi-modal") closeCoordTempiModal();
        else if (id === "coord-atrezzi-modal") closeCoordAtrezziModal();
        else modal.classList.remove("open");
      }
    });
    // chiudi TFR dropdowns se click fuori
    ["tfr-esercizi-dropdown","tfr-descrizione-dropdown"].forEach(id => {
      const dd = document.getElementById(id);
      if (dd?.classList.contains("open")) {
        const btn = document.getElementById(id === "tfr-esercizi-dropdown" ? "tfr-esercizio-btn" : "tfr-descrizione-btn");
        if (!dd.contains(e.target) && !btn?.contains(e.target)) dd.classList.remove("open");
      }
    });

    // chiudi TFR tempi modal se click su backdrop
    const tfrModal = document.getElementById("tfrTempiModal");
    if (tfrModal?.classList.contains("open") && e.target === tfrModal) closeTfrTempiModal();

    // close risc dropdown if click outside
    const list = document.getElementById("risc-dropdown-list");
    const btn  = document.getElementById("risc-dropdown-btn");
    if (list && btn && !btn.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove("open");
    }
  });

  renderFrecce();
  renderRiscaldamento();
  renderTfc();
  calcolaFrecceTFC();
  renderStretching();
  renderForza();
  renderCoord();

  window.addEventListener("beforeunload", () => {
    clearTimeout(_saveTimer);
    persistToDb();
  });
});
