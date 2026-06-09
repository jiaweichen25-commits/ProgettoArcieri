const API_URL    = "http://localhost:8000";
const params     = new URLSearchParams(location.search);
const atNome     = decodeURIComponent(params.get("nome") || "Atleta");
const KEY_ALL    = "arcieri_allenamenti_" + (params.get("id") || "");
const atletaId   = params.get("id");
const _cu        = JSON.parse(localStorage.getItem("currentUser") || "null");
const isIstruttore = _cu?.role === "istruttore";
const BASE_MAT   = isIstruttore
  ? `/istruttore/atleti/${atletaId}/materiali`
  : `/atleta/me/materiali`;

let sets        = [];
let selectedId  = null;

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

const FIELDS = [
  ["mRiser","Riser"],["mLunRiser","LunghezzaRiser"],["mFlettenti","Flettenti"],
  ["mLunFlett","LunghezzaFlettenti"],["mPotNom","PotenzaNominale"],["mRest","Rest"],
  ["mMirino","Mirino"],["mStab","Stabilizzazione"],["mAste","Aste"],["mLunAste","LunghezzaAste"],
  ["mPunte","Punte"],["mPesoPunte","PesoPunte"],["mCocche","Cocche"],
  ["mAlette","Alette"],["mLunAlet","LunghezzaAlette"],["mSpine","Spine"],
  ["mCorda","Corda"],["mFili","Fili"],["mPatella","Patella"],
  ["mBottone","Bottone"],["mMolla","Molla"],["mTillerSup","TillerSuperiore"],
  ["mTillerInf","TillerInferiore"],["mBrace","Brace"],["mAllungo","Allungo"],
  ["mPotReale","PotenzaReale"],["mPuntoInc","PuntoIncocco"]
];

// ── API ─────────────────────────────────────────────────────────────────────
async function loadFromAPI() {
  const res = await fetch(`${API_URL}${BASE_MAT}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Errore caricamento materiali");
  sets = await res.json();
  render();
}

async function apiCreate(obj) {
  const res = await fetch(`${API_URL}${BASE_MAT}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(obj),
  });
  if (!res.ok) throw new Error("Errore salvataggio");
  return await res.json();
}

async function apiUpdate(id, obj) {
  const res = await fetch(`${API_URL}${BASE_MAT}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(obj),
  });
  if (!res.ok) throw new Error("Errore aggiornamento");
}

async function apiDelete(id) {
  const res = await fetch(`${API_URL}${BASE_MAT}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Errore eliminazione");
}

// ── HELPERS ─────────────────────────────────────────────────────────────────
function loadAll() { try { return JSON.parse(localStorage.getItem(KEY_ALL)) || []; } catch { return []; } }

function fmtDate(d) {
  if (!d) return "—";
  const [y, m, g] = d.split("-");
  return `${g}/${m}/${y}`;
}
function fld(label, val) {
  return `<div class="field-item"><label>${label}</label><input readonly value="${val || ""}"></div>`;
}
function fldW(label, val) {
  return `<div class="field-item wide"><label>${label}</label><input readonly value="${val || ""}"></div>`;
}

// ── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  const container = document.getElementById("cardContainer");
  const empty     = document.getElementById("emptyState");

  document.getElementById("countLabel").textContent =
    sets.length ? `${sets.length} set registrat${sets.length === 1 ? "o" : "i"}` : "";

  container.querySelectorAll(".eq-card").forEach(c => c.remove());

  if (sets.length === 0) { empty.style.display = "block"; selectedId = null; return; }
  empty.style.display = "none";

  sets.forEach((s) => {
    const card  = document.createElement("div");
    const isSel = (s.IDmateriale === selectedId);
    card.className = "eq-card" + (s.MaterialeCorrente ? " in-uso" : "") + (isSel ? " selected" : "");
    card.onclick   = () => selectCard(s.IDmateriale);

    card.innerHTML = `
      <div class="eq-card-header">
        <span class="eq-date">${fmtDate(s.Data)}</span>
        ${s.MaterialeCorrente ? '<span class="badge-uso">✔ In Uso</span>'      : ""}
        ${isSel               ? '<span class="badge-sel">✔ Selezionato</span>' : ""}
        <div class="card-actions" onclick="event.stopPropagation()">
          <button class="btn-icon" onclick="editSet(${s.IDmateriale})">✏️ Modifica</button>
        </div>
      </div>
      <div class="eq-sections">
        <div class="eq-section">
          <div class="section-title">🏹 Arco</div>
          <div class="field-grid">
            ${fld("Riser", s.Riser)}${fld("Lung. Riser", s.LunghezzaRiser)}
            ${fld("Flettenti", s.Flettenti)}${fld("Lung. Flettenti", s.LunghezzaFlettenti)}
            ${fld("Potenza Nominale", s.PotenzaNominale)}${fld("Rest", s.Rest)}
            ${fld("Mirino", s.Mirino)}${fld("Stabilizzazione", s.Stabilizzazione)}
            ${fld("Aste", s.Aste)}${fld("Lung. Aste", s.LunghezzaAste)}
          </div>
        </div>
        <div class="eq-section">
          <div class="section-title">🎯 Frecce</div>
          <div class="field-grid">
            ${fld("Punte", s.Punte)}${fld("Peso Punte", s.PesoPunte)}
            ${fld("Cocche", s.Cocche)}${fld("Alette", s.Alette)}
            ${fld("Lung. Alette", s.LunghezzaAlette)}${fld("Spine", s.Spine)}
            ${fld("Corda", s.Corda)}${fld("Fili", s.Fili)}
            ${fldW("Patella", s.Patella)}
          </div>
        </div>
        <div class="eq-section">
          <div class="section-title">⚙️ Regolazioni</div>
          <div class="field-grid">
            ${fld("Bottone", s.Bottone)}${fld("Molla", s.Molla)}
            ${fld("Tiller Superiore", s.TillerSuperiore)}${fld("Tiller Inferiore", s.TillerInferiore)}
            ${fld("Brace", s.Brace)}${fld("Allungo", s.Allungo)}
            ${fld("Potenza Reale", s.PotenzaReale)}${fld("Punto Incocco", s.PuntoIncocco)}
          </div>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

// ── SELEZIONE ────────────────────────────────────────────────────────────────
function selectCard(id) {
  selectedId = (selectedId === id) ? null : id;
  render();
}

function requireSelection() {
  if (!selectedId) {
    alert("Seleziona prima un set cliccando su una card.");
    return false;
  }
  return true;
}

// ── BOTTONE 1: DUPLICA ───────────────────────────────────────────────────────
async function duplicaSet() {
  if (!requireSelection()) return;
  const s = sets.find(x => x.IDmateriale === selectedId);
  if (!s) return;
  const copia = { ...s, Data: "", MaterialeCorrente: false };
  delete copia.IDmateriale;
  try {
    await apiCreate(copia);
    await loadFromAPI();
  } catch (e) { alert(e.message); }
}

// ── BOTTONE 2: ELIMINA ───────────────────────────────────────────────────────
async function eliminaSet() {
  if (!requireSelection()) return;
  const s = sets.find(x => x.IDmateriale === selectedId);
  if (!confirm(`Eliminare il set del ${fmtDate(s.Data)}?`)) return;
  try {
    await apiDelete(selectedId);
    selectedId = null;
    await loadFromAPI();
  } catch (e) { alert(e.message); }
}

// ── BOTTONE 3: ALLENAMENTO DELLA DATA ────────────────────────────────────────
function showAllenamento() {
  if (!requireSelection()) return;
  const s       = sets.find(x => x.IDmateriale === selectedId);
  const setData = s.Data;
  const all     = loadAll();
  const matches = all.filter(a => a.data === setData);
  const dataFmt = fmtDate(setData);

  document.getElementById("allModalTitle").textContent = `Allenamenti del ${dataFmt}`;

  const div = document.getElementById("allList");
  if (matches.length === 0) {
    div.innerHTML = `
      <div style="text-align:center; padding:30px 0; color:var(--muted);">
        <div style="font-size:2.5rem; margin-bottom:8px;">📭</div>
        <p>Nessun allenamento registrato per il <strong>${dataFmt}</strong>.</p>
      </div>`;
  } else {
    div.innerHTML = matches.map(a => `
      <div class="all-card">
        <div class="all-card-date">📅 ${fmtDate(a.data)}</div>
        <div class="all-row"><strong>Tipo:</strong>&nbsp;${a.tipo || "—"}</div>
        <div class="all-row"><strong>Durata:</strong>&nbsp;${a.durata ? a.durata + " min" : "—"}</div>
        ${a.note ? `<div class="all-row" style="margin-top:4px;">${a.note}</div>` : ""}
      </div>`).join("");
  }
  document.getElementById("allModal").classList.add("open");
}

// ── MODAL AGGIUNGI / MODIFICA ─────────────────────────────────────────────────
function openAddModal() {
  document.getElementById("modalTitle").textContent = "Nuovo Set Materiali";
  document.getElementById("editId").value  = "";
  document.getElementById("mData").value    = new Date().toISOString().split("T")[0];
  document.getElementById("mInUso").checked = false;
  FIELDS.forEach(([id]) => document.getElementById(id).value = "");
  document.getElementById("addModal").classList.add("open");
}

function editSet(id) {
  const s = sets.find(x => x.IDmateriale === id);
  if (!s) return;
  document.getElementById("modalTitle").textContent = "Modifica Set Materiali";
  document.getElementById("editId").value  = id;
  document.getElementById("mData").value    = s.Data || "";
  document.getElementById("mInUso").checked = !!s.MaterialeCorrente;
  FIELDS.forEach(([htmlId, dbKey]) => document.getElementById(htmlId).value = s[dbKey] || "");
  document.getElementById("addModal").classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

async function saveSet() {
  const obj = { Data: document.getElementById("mData").value, MaterialeCorrente: document.getElementById("mInUso").checked };
  FIELDS.forEach(([htmlId, dbKey]) => obj[dbKey] = document.getElementById(htmlId).value.trim() || null);

  const editId = document.getElementById("editId").value;
  try {
    if (editId) {
      await apiUpdate(parseInt(editId), obj);
    } else {
      await apiCreate(obj);
    }
    closeModal("addModal");
    await loadFromAPI();
  } catch (e) { alert(e.message); }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.getElementById("atletaName").textContent = atNome;
loadFromAPI().catch(() => alert("Errore nel caricamento dei materiali. Verifica di essere autenticato."));
