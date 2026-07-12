const API_URL = "http://localhost:8000";

const params = new URLSearchParams(window.location.search);
const ID_ALLENAMENTO = Number(params.get("allenamento"));
const ID_ATLETA      = Number(params.get("atleta"));
const NOME_ATLETA    = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";
const DATA_INIZIO    = params.get("inizio") || "";
const DATA_FINE      = params.get("fine") || "";

let settimanaAttuale = null;
let sedutaAttuale    = null;

// Cache lookup tables
let lookupStretching   = [];
let lookupRiscaldamento = [];
let lookupDistanza     = [];
let lookupTarga        = [];
let lookupDesEsercizio = [];
let lookupTabellaN     = [];
let lookupDesFisForRes = [];
let lookupAttrezzi     = [];
let lookupDesFisCor    = [];
let lookupPosizionePiedi = [];
let lookupSerie        = [];

// Cache dati seduta corrente
let cacheRiscaldamento = [];
let cacheTecForCor     = [];
let cacheStretching    = [];
let cacheAllFisForRes  = [];
let cacheAllFisCor     = [];

// Stato modale corrente
let modalSezione  = null;
let modalIdRecord = null;

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

function getToken() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function requireAuth() {
  const token = getToken();
  if (!token) { window.location.href = "../../Autenticazione/Istruttore.html"; return false; }
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.ruolo !== "istruttore") {
      localStorage.clear();
      window.location.href = "../../Autenticazione/Istruttore.html";
      return false;
    }
    return true;
  } catch {
    window.location.href = "../../Autenticazione/Istruttore.html";
    return false;
  }
}

function tornaAllenamenti() {
  const q = new URLSearchParams({ atleta: ID_ATLETA, nome: NOME_ATLETA, cognome: COGNOME_ATLETA });
  window.location.href = `Allenamenti.html?${q.toString()}`;
}

function stampaPagina() {
  window.print();
}

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────

function escHtml(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function showMsg(boxId, testo, tipo) {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.textContent = testo;
  box.className = "msg-box " + tipo;
}

function clearMsg(boxId) {
  const box = document.getElementById(boxId);
  if (box) box.className = "msg-box";
}

function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); clearMsg("formMsgBox"); }

function buildSelect(options, valueKey, labelKey, selectedVal) {
  let html = `<option value="">— seleziona —</option>`;
  options.forEach(o => {
    const sel = o[valueKey] == selectedVal ? "selected" : "";
    html += `<option value="${o[valueKey]}" ${sel}>${escHtml(String(o[labelKey] ?? ""))}</option>`;
  });
  return html;
}

// Select per i 7 giorni di TecForCor: il VALUE è il testo "Serie" (es. "6x12"),
// non l'IDserie — perché nel DB i campi Lunedi...Domenica restano testo libero,
// e il backend calcola il totale frecce confrontando questo testo con TSserie.Serie.
function buildSelectSerie(selectedVal) {
  let html = `<option value="">—</option>`;
  lookupSerie.forEach(s => {
    const sel = s.Serie === selectedVal ? "selected" : "";
    html += `<option value="${escHtml(s.Serie)}" ${sel}>${escHtml(s.Serie)} (${s.NumeroFrecce})</option>`;
  });
  return html;
}

// ─────────────────────────────────────────
// CARICA LOOKUP TABLES (una volta sola)
// ─────────────────────────────────────────

async function caricaLookup() {
  const endpoints = [
    { url: "/allenamenti/lookup/stretching/",           key: "stretching" },
    { url: "/allenamenti/lookup/riscaldamento/",        key: "riscaldamento" },
    { url: "/allenamenti/lookup/distanza/",             key: "distanza" },
    { url: "/allenamenti/lookup/targa/",                key: "targa" },
    { url: "/allenamenti/lookup/posizione-piedi/",      key: "posizionePiedi" },
    { url: "/allenamenti/lookup/descrizione-esercizio/", key: "desEsercizio" },
    { url: "/allenamenti/lookup/tabella-numero/",       key: "tabellaN" },
    { url: "/allenamenti/lookup/allfisforres-descrizione/", key: "desFisForRes" },
    { url: "/allenamenti/lookup/attrezzi/",             key: "attrezzi" },
    { url: "/allenamenti/lookup/allfiscor-descrizione/", key: "desFisCor" },
    { url: "/allenamenti/lookup/serie/",                key: "serie" },
  ];

  await Promise.all(endpoints.map(async ({ url, key }) => {
    try {
      const res = await fetch(`${API_URL}${url}`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (key === "stretching")    lookupStretching    = data;
      if (key === "riscaldamento") lookupRiscaldamento = data;
      if (key === "distanza")      lookupDistanza      = data;
      if (key === "targa")         lookupTarga         = data;
      if (key === "posizionePiedi") lookupPosizionePiedi = data;
      if (key === "desEsercizio")  lookupDesEsercizio  = data;
      if (key === "tabellaN")      lookupTabellaN      = data;
      if (key === "desFisForRes")  lookupDesFisForRes  = data;
      if (key === "attrezzi")      lookupAttrezzi      = data;
      if (key === "desFisCor")     lookupDesFisCor     = data;
      if (key === "serie")         lookupSerie         = data;
    } catch { /* ignora errori singole lookup */ }
  }));
}

// ─────────────────────────────────────────
// CARICA SEDUTA COMPLETA
// ─────────────────────────────────────────

async function caricaSeduta() {
  const idS   = Number(document.getElementById("selSettimana").value);
  const idSed = Number(document.getElementById("selSeduta").value);

  if (!idS || !idSed) {
    showMsg("pageMsgBox", "Seleziona settimana e seduta.", "error");
    return;
  }

  settimanaAttuale = idS;
  sedutaAttuale    = idSed;
  clearMsg("pageMsgBox");

  // Crea la riga in TdetAllenamenti se non esiste ancora
await fetch(
    `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${idS}/sedute/${idSed}/inizializza`,
    { 
        method: "POST", 
        headers: authHeaders(),
        body: JSON.stringify({})
    }
);
  document.getElementById("sezioniDettaglio").style.display = "block";
  document.getElementById("labelSettSed").textContent = `Settimana ${idS} — Seduta ${idSed}`;

  await Promise.all([
    fetchSezione("riscaldamento"),
    fetchSezione("tecforcor"),
    fetchSezione("stretching"),
    fetchSezione("allfisforres"),
    fetchSezione("allfiscor"),
    fetchNota(),
  ]);

  caricaSeduteEsistenti();
}

async function caricaSeduteEsistenti() {
  try {
    const res = await fetch(`${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane-sedute/`, { headers: authHeaders() });
    if (!res.ok) return;
    const lista = await res.json();

    const box  = document.getElementById("seduteEsistentiBox");
    const cont = document.getElementById("seduteEsistentiList");

    if (!lista.length) { box.style.display = "none"; return; }

    box.style.display = "block";
    cont.innerHTML = lista.map(s => `
      <div class="chip-seduta${s.ha_contenuto ? " con-contenuto" : ""}" onclick="selezionaSeduta(${s.IDsettimana}, ${s.IDseduta})">
        Sett. ${s.IDsettimana} · Sed. ${s.IDseduta}
        ${!s.ha_contenuto ? `<span class="chip-elimina" onclick="eliminaSedutaEsistente(event, ${s.IDsettimana}, ${s.IDseduta})">×</span>` : ""}
      </div>
    `).join("");
  } catch { /* ignora */ }
}

function selezionaSeduta(idSettimana, idSeduta) {
  document.getElementById("selSettimana").value = idSettimana;
  document.getElementById("selSeduta").value = idSeduta;
  caricaSeduta();
}

async function eliminaSedutaEsistente(event, idSettimana, idSeduta) {
  event.stopPropagation();
  if (!confirm(`Eliminare la seduta ${idSettimana} — ${idSeduta}? È vuota, non contiene dati.`)) return;
  try {
    const res = await fetch(`${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${idSettimana}/sedute/${idSeduta}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      alert("Errore nell'eliminazione.");
      return;
    }
    caricaSeduteEsistenti();
  } catch {
    alert("Impossibile contattare il server.");
  }
}

async function fetchSezione(sezione) {
  const url = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaAttuale}/sedute/${sedutaAttuale}/${sezione}/`;
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    if (sezione === "riscaldamento") { cacheRiscaldamento = data; renderRiscaldamento(); }
    if (sezione === "tecforcor")     { cacheTecForCor     = data; renderTecForCor(); caricaTotaleFrecce(); }
    if (sezione === "stretching")    { cacheStretching    = data; renderStretching(); }
    if (sezione === "allfisforres")  { cacheAllFisForRes  = data; renderAllFisForRes(); }
    if (sezione === "allfiscor")     { cacheAllFisCor     = data; renderAllFisCor(); }
  } catch { /* ignora */ }
}

async function fetchNota() {
  const url = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaAttuale}/nota/`;
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById("notaTextarea").value = data ? (data.nota || "") : "";
  } catch { /* ignora */ }
}

// — TOTALE FRECCE (sezione TecForCor) —
async function caricaTotaleFrecce() {
  const url = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaAttuale}/sedute/${sedutaAttuale}/tecforcor/totale-frecce`;
  const box = document.getElementById("totaleFrecceBox");
  if (!box) return;
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return;
    const t = await res.json();
    box.innerHTML =
      `Lun: <strong>${t.lunedi}</strong> · Mar: <strong>${t.martedi}</strong> · Mer: <strong>${t.mercoledi}</strong> · ` +
      `Gio: <strong>${t.giovedi}</strong> · Ven: <strong>${t.venerdi}</strong> · Sab: <strong>${t.sabato}</strong> · Dom: <strong>${t.domenica}</strong>` +
      ` &nbsp;|&nbsp; Totale settimana: <strong>${t.totale}</strong>`;
  } catch { /* ignora */ }
}

// ─────────────────────────────────────────
// RENDER SEZIONI
// ─────────────────────────────────────────

const GIORNI = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
const GIORNI_LABEL = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function headerGiorni() {
  return GIORNI_LABEL.map(g => `<th>${g}</th>`).join("");
}

function celleGiorni(record) {
  return GIORNI.map(g => `<td>${escHtml(record[g])}</td>`).join("");
}

// — RISCALDAMENTO —
function renderRiscaldamento() {
  const tbody = document.getElementById("tbodyRiscaldamento");
  if (!cacheRiscaldamento.length) { tbody.innerHTML = `<tr><td colspan="10" class="empty-row">Nessuna riga</td></tr>`; return; }
  tbody.innerHTML = cacheRiscaldamento.map(r => {
    const nomeEs = lookupRiscaldamento.find(l => l.IDesercizioRiscaldamento === r.id_esercizio_riscaldamento)?.NomeEsercizio || "—";
    return `<tr>
      <td>${escHtml(nomeEs)}</td>
      ${celleGiorni(r)}
      <td class="td-actions">
        <button class="btn btn-sm btn-outline" onclick="apriModaleRiscaldamento(${r.IDdetRiscaldamento})">Modifica</button>
        <button class="btn btn-sm btn-red" onclick="eliminaRiga('riscaldamento', ${r.IDdetRiscaldamento})">Elimina</button>
      </td>
    </tr>`;
  }).join("");
}

// — TEC FOR COR —
function renderTecForCor() {
  const tbody = document.getElementById("tbodyTecForCor");
  if (!cacheTecForCor.length) { tbody.innerHTML = `<tr><td colspan="12" class="empty-row">Nessuna riga</td></tr>`; return; }
  tbody.innerHTML = cacheTecForCor.map(r => {
    const posPiedi = lookupPosizionePiedi.find(l => l.IDposizionePiedi === r.id_posizione_piedi)?.NomePosizione || "—";
    const dist = lookupDistanza.find(l => l.IDdistanza === r.id_distanza)?.NomeEsercizio || "—";
    const targ = lookupTarga.find(l => l.IDtarga === r.id_targa)?.NomeTarga || "—";
    const des  = lookupDesEsercizio.find(l => l.IDdescrizioneEsercizio === r.id_descrizione_esercizio)?.NomeEsercizio || "—";
    return `<tr>
      <td>${escHtml(posPiedi)}</td>
      <td>${escHtml(dist)}</td>
      <td>${escHtml(targ)}</td>
      <td>${escHtml(des)}</td>
      ${celleGiorni(r)}
      <td class="td-actions">
        <button class="btn btn-sm btn-outline" onclick="apriModaleTecForCor(${r.IDdetTecForCor})">Modifica</button>
        <button class="btn btn-sm btn-red" onclick="eliminaRiga('tecforcor', ${r.IDdetTecForCor})">Elimina</button>
      </td>
    </tr>`;
  }).join("");
}

// — STRETCHING —
function renderStretching() {
  const tbody = document.getElementById("tbodyStretching");
  if (!cacheStretching.length) { tbody.innerHTML = `<tr><td colspan="10" class="empty-row">Nessuna riga</td></tr>`; return; }
  tbody.innerHTML = cacheStretching.map(r => {
    const nomeEs = lookupStretching.find(l => l.IDesercizioStretching === r.id_esercizio_stretching)?.NomeEsercizio || "—";
    return `<tr>
      <td>${escHtml(nomeEs)}</td>
      ${celleGiorni(r)}
      <td class="td-actions">
        <button class="btn btn-sm btn-outline" onclick="apriModaleStretching(${r.IDdetStretching})">Modifica</button>
        <button class="btn btn-sm btn-red" onclick="eliminaRiga('stretching', ${r.IDdetStretching})">Elimina</button>
      </td>
    </tr>`;
  }).join("");
}

// — ALL FIS FOR RES —
function renderAllFisForRes() {
  const tbody = document.getElementById("tbodyAllFisForRes");
  if (!cacheAllFisForRes.length) { tbody.innerHTML = `<tr><td colspan="10" class="empty-row">Nessuna riga</td></tr>`; return; }
  tbody.innerHTML = cacheAllFisForRes.map(r => {
    const tabN = lookupTabellaN.find(l => l.IDtabella_n === r.id_tabella_n)?.NumeroTabella ?? "—";
    const des  = lookupDesFisForRes.find(l => l.IDdescrizioneEsercizioAllFisForRes === r.id_descrizione_esercizio_all_fis_for_res)?.DescrizioneEsercizio || "—";
    return `<tr>
      <td>${escHtml(String(tabN))}</td>
      <td>${escHtml(des)}</td>
      ${celleGiorni(r)}
      <td class="td-actions">
        <button class="btn btn-sm btn-outline" onclick="apriModaleAllFisForRes(${r.IDdetAllFisForRes})">Modifica</button>
        <button class="btn btn-sm btn-red" onclick="eliminaRiga('allfisforres', ${r.IDdetAllFisForRes})">Elimina</button>
      </td>
    </tr>`;
  }).join("");
}

// — ALL FIS COR —
function renderAllFisCor() {
  const tbody = document.getElementById("tbodyAllFisCor");
  if (!cacheAllFisCor.length) { tbody.innerHTML = `<tr><td colspan="10" class="empty-row">Nessuna riga</td></tr>`; return; }
  tbody.innerHTML = cacheAllFisCor.map(r => {
    const attr = lookupAttrezzi.find(l => l.IDattrezzo === r.id_attrezzo)?.AttrezzoDes || "—";
    const des  = lookupDesFisCor.find(l => l.IDdescrizioneEsercizioAllFisCor === r.id_descrizione_esercizio_all_fis_cor)?.DescrizioneEsercizio || "—";
    return `<tr>
      <td>${escHtml(attr)}</td>
      <td>${escHtml(des)}</td>
      ${celleGiorni(r)}
      <td class="td-actions">
        <button class="btn btn-sm btn-outline" onclick="apriModaleAllFisCor(${r.IDdetAllFisCor})">Modifica</button>
        <button class="btn btn-sm btn-red" onclick="eliminaRiga('allfiscor', ${r.IDdetAllFisCor})">Elimina</button>
      </td>
    </tr>`;
  }).join("");
}

// ─────────────────────────────────────────
// APERTURA MODALI
// ─────────────────────────────────────────

function apriModaleRiscaldamento(idRecord) {
  modalSezione  = "riscaldamento";
  modalIdRecord = idRecord || null;
  const r = idRecord ? cacheRiscaldamento.find(x => x.IDdetRiscaldamento === idRecord) : null;

  document.getElementById("formModalPill").textContent  = r ? "Modifica" : "Nuova riga";
  document.getElementById("formModalTitle").textContent = r ? "Modifica Riscaldamento" : "Aggiungi Riscaldamento";

  document.getElementById("campiRiscaldamento").style.display  = "block";
  document.getElementById("campiTecForCor").style.display      = "none";
  document.getElementById("campiStretching").style.display     = "none";
  document.getElementById("campiAllFisForRes").style.display   = "none";
  document.getElementById("campiAllFisCor").style.display      = "none";

  document.getElementById("fRiscEsercizio").innerHTML = buildSelect(lookupRiscaldamento, "IDesercizioRiscaldamento", "NomeEsercizio", r?.id_esercizio_riscaldamento);
  GIORNI.forEach(g => { document.getElementById(`fRisc_${g}`).value = r ? (r[g] || "") : ""; });

  clearMsg("formMsgBox");
  openModal("formModal");
}

function apriModaleTecForCor(idRecord) {
  modalSezione  = "tecforcor";
  modalIdRecord = idRecord || null;
  const r = idRecord ? cacheTecForCor.find(x => x.IDdetTecForCor === idRecord) : null;

  document.getElementById("formModalPill").textContent  = r ? "Modifica" : "Nuova riga";
  document.getElementById("formModalTitle").textContent = r ? "Modifica Tecnica-Forza-Coordinazione" : "Aggiungi Tecnica-Forza-Coordinazione";

  document.getElementById("campiRiscaldamento").style.display  = "none";
  document.getElementById("campiTecForCor").style.display      = "block";
  document.getElementById("campiStretching").style.display     = "none";
  document.getElementById("campiAllFisForRes").style.display   = "none";
  document.getElementById("campiAllFisCor").style.display      = "none";

  document.getElementById("fTecPosizionePiedi").innerHTML    = buildSelect(lookupPosizionePiedi, "IDposizionePiedi", "NomePosizione", r?.id_posizione_piedi);
  document.getElementById("fTecDistanza").innerHTML          = buildSelect(lookupDistanza,     "IDdistanza",             "NomeEsercizio",  r?.id_distanza);
  document.getElementById("fTecTarga").innerHTML             = buildSelect(lookupTarga,        "IDtarga",                "NomeTarga",      r?.id_targa);
  document.getElementById("fTecDesEsercizio").innerHTML      = buildSelect(lookupDesEsercizio, "IDdescrizioneEsercizio", "NomeEsercizio",  r?.id_descrizione_esercizio);

  // catalogo Serie (solo per gestione +/x, non legato al record)
  document.getElementById("fTecSerieRef").innerHTML = buildSelect(lookupSerie, "IDserie", "Serie", null);

  // i 7 giorni ora sono select collegati alla lookup Serie
  GIORNI.forEach(g => { document.getElementById(`fTec_${g}`).innerHTML = buildSelectSerie(r ? (r[g] || null) : null); });

  clearMsg("formMsgBox");
  openModal("formModal");
}

function apriModaleStretching(idRecord) {
  modalSezione  = "stretching";
  modalIdRecord = idRecord || null;
  const r = idRecord ? cacheStretching.find(x => x.IDdetStretching === idRecord) : null;

  document.getElementById("formModalPill").textContent  = r ? "Modifica" : "Nuova riga";
  document.getElementById("formModalTitle").textContent = r ? "Modifica Stretching" : "Aggiungi Stretching";

  document.getElementById("campiRiscaldamento").style.display  = "none";
  document.getElementById("campiTecForCor").style.display      = "none";
  document.getElementById("campiStretching").style.display     = "block";
  document.getElementById("campiAllFisForRes").style.display   = "none";
  document.getElementById("campiAllFisCor").style.display      = "none";

  document.getElementById("fStrEsercizio").innerHTML = buildSelect(lookupStretching, "IDesercizioStretching", "NomeEsercizio", r?.id_esercizio_stretching);
  GIORNI.forEach(g => { document.getElementById(`fStr_${g}`).value = r ? (r[g] || "") : ""; });

  clearMsg("formMsgBox");
  openModal("formModal");
}

function apriModaleAllFisForRes(idRecord) {
  modalSezione  = "allfisforres";
  modalIdRecord = idRecord || null;
  const r = idRecord ? cacheAllFisForRes.find(x => x.IDdetAllFisForRes === idRecord) : null;

  document.getElementById("formModalPill").textContent  = r ? "Modifica" : "Nuova riga";
  document.getElementById("formModalTitle").textContent = r ? "Modifica All. Fisico - Forza/Resistenza" : "Aggiungi All. Fisico - Forza/Resistenza";

  document.getElementById("campiRiscaldamento").style.display  = "none";
  document.getElementById("campiTecForCor").style.display      = "none";
  document.getElementById("campiStretching").style.display     = "none";
  document.getElementById("campiAllFisForRes").style.display   = "block";
  document.getElementById("campiAllFisCor").style.display      = "none";

  document.getElementById("fFRTabellaN").innerHTML   = buildSelect(lookupTabellaN,    "IDtabella_n", "NumeroTabella",        r?.id_tabella_n);
  document.getElementById("fFRDescrizione").innerHTML = buildSelect(lookupDesFisForRes, "IDdescrizioneEsercizioAllFisForRes", "DescrizioneEsercizio", r?.id_descrizione_esercizio_all_fis_for_res);
  GIORNI.forEach(g => { document.getElementById(`fFR_${g}`).value = r ? (r[g] || "") : ""; });

  clearMsg("formMsgBox");
  openModal("formModal");
}

function apriModaleAllFisCor(idRecord) {
  modalSezione  = "allfiscor";
  modalIdRecord = idRecord || null;
  const r = idRecord ? cacheAllFisCor.find(x => x.IDdetAllFisCor === idRecord) : null;

  document.getElementById("formModalPill").textContent  = r ? "Modifica" : "Nuova riga";
  document.getElementById("formModalTitle").textContent = r ? "Modifica All. Fisico - Coordinazione" : "Aggiungi All. Fisico - Coordinazione";

  document.getElementById("campiRiscaldamento").style.display  = "none";
  document.getElementById("campiTecForCor").style.display      = "none";
  document.getElementById("campiStretching").style.display     = "none";
  document.getElementById("campiAllFisForRes").style.display   = "none";
  document.getElementById("campiAllFisCor").style.display      = "block";

  document.getElementById("fCOAttrezzo").innerHTML    = buildSelect(lookupAttrezzi,  "IDattrezzo",                          "AttrezzoDes",          r?.id_attrezzo);
  document.getElementById("fCODescrizione").innerHTML = buildSelect(lookupDesFisCor, "IDdescrizioneEsercizioAllFisCor",     "DescrizioneEsercizio", r?.id_descrizione_esercizio_all_fis_cor);
  GIORNI.forEach(g => { document.getElementById(`fCO_${g}`).value = r ? (r[g] || "") : ""; });

  clearMsg("formMsgBox");
  openModal("formModal");
}

// ─────────────────────────────────────────
// SALVA (POST o PUT)
// ─────────────────────────────────────────

async function salvaRiga() {
  clearMsg("formMsgBox");
  const isEdit = !!modalIdRecord;
  let body = {};
  let url  = "";

  const baseUrl = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaAttuale}/sedute/${sedutaAttuale}`;

  if (modalSezione === "riscaldamento") {
    body = {
      id_esercizio_riscaldamento: Number(document.getElementById("fRiscEsercizio").value) || null,
      ...Object.fromEntries(GIORNI.map(g => [g, document.getElementById(`fRisc_${g}`).value.trim() || null])),
    };
    url = isEdit ? `${baseUrl}/riscaldamento/${modalIdRecord}` : `${baseUrl}/riscaldamento/`;
  }

  else if (modalSezione === "tecforcor") {
    body = {
      id_posizione_piedi:       Number(document.getElementById("fTecPosizionePiedi").value) || null,
      id_distanza:              Number(document.getElementById("fTecDistanza").value) || null,
      id_targa:                 Number(document.getElementById("fTecTarga").value) || null,
      id_descrizione_esercizio: Number(document.getElementById("fTecDesEsercizio").value) || null,
      ...Object.fromEntries(GIORNI.map(g => [g, document.getElementById(`fTec_${g}`).value.trim() || null])),
    };
    url = isEdit ? `${baseUrl}/tecforcor/${modalIdRecord}` : `${baseUrl}/tecforcor/`;
  }

  else if (modalSezione === "stretching") {
    body = {
      id_esercizio_stretching: Number(document.getElementById("fStrEsercizio").value) || null,
      ...Object.fromEntries(GIORNI.map(g => [g, document.getElementById(`fStr_${g}`).value.trim() || null])),
    };
    url = isEdit ? `${baseUrl}/stretching/${modalIdRecord}` : `${baseUrl}/stretching/`;
  }

  else if (modalSezione === "allfisforres") {
    body = {
      id_tabella_n:                               Number(document.getElementById("fFRTabellaN").value) || null,
      id_descrizione_esercizio_all_fis_for_res:   Number(document.getElementById("fFRDescrizione").value) || null,
      ...Object.fromEntries(GIORNI.map(g => [g, document.getElementById(`fFR_${g}`).value.trim() || null])),
    };
    url = isEdit ? `${baseUrl}/allfisforres/${modalIdRecord}` : `${baseUrl}/allfisforres/`;
  }

  else if (modalSezione === "allfiscor") {
    body = {
      id_attrezzo:                          Number(document.getElementById("fCOAttrezzo").value) || null,
      id_descrizione_esercizio_all_fis_cor: Number(document.getElementById("fCODescrizione").value) || null,
      ...Object.fromEntries(GIORNI.map(g => [g, document.getElementById(`fCO_${g}`).value.trim() || null])),
    };
    url = isEdit ? `${baseUrl}/allfiscor/${modalIdRecord}` : `${baseUrl}/allfiscor/`;
  }

  try {
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("formMsgBox", err.detail || "Errore nel salvataggio.", "error");
      return;
    }
    closeModal("formModal");
    await fetchSezione(modalSezione);
  } catch {
    showMsg("formMsgBox", "Impossibile contattare il server.", "error");
  }
}

// ─────────────────────────────────────────
// ELIMINA RIGA
// ─────────────────────────────────────────

async function eliminaRiga(sezione, idRecord) {
  if (!confirm("Eliminare questa riga?")) return;
  const baseUrl = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaAttuale}/sedute/${sedutaAttuale}`;
  const url = `${baseUrl}/${sezione}/${idRecord}`;
  try {
    const res = await fetch(url, { method: "DELETE", headers: authHeaders() });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Errore nell'eliminazione.");
      return;
    }
    await fetchSezione(sezione);
  } catch {
    alert("Impossibile contattare il server.");
  }
}

// ─────────────────────────────────────────
// SALVA NOTA
// ─────────────────────────────────────────

async function salvaNota() {
  const nota = document.getElementById("notaTextarea").value.trim() || null;
  const url  = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaAttuale}/nota/`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ nota }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("notaMsgBox", err.detail || "Errore nel salvataggio.", "error");
      return;
    }
    showMsg("notaMsgBox", "Nota salvata.", "success");
  } catch {
    showMsg("notaMsgBox", "Impossibile contattare il server.", "error");
  }
}

// ─────────────────────────────────────────
// GESTIONE LOOKUP TABLES DA FRONTEND
// ─────────────────────────────────────────

async function refreshOpenModalLookups() {
  await caricaLookup();
  if (modalSezione === "riscaldamento") {
    document.getElementById("fRiscEsercizio").innerHTML = buildSelect(lookupRiscaldamento, "IDesercizioRiscaldamento", "NomeEsercizio", document.getElementById("fRiscEsercizio").value);
  }
  else if (modalSezione === "tecforcor") {
    document.getElementById("fTecPosizionePiedi").innerHTML    = buildSelect(lookupPosizionePiedi, "IDposizionePiedi", "NomePosizione", document.getElementById("fTecPosizionePiedi").value);
    document.getElementById("fTecDistanza").innerHTML          = buildSelect(lookupDistanza,     "IDdistanza",             "NomeEsercizio", document.getElementById("fTecDistanza").value);
    document.getElementById("fTecTarga").innerHTML             = buildSelect(lookupTarga,        "IDtarga",                "NomeTarga", document.getElementById("fTecTarga").value);
    document.getElementById("fTecDesEsercizio").innerHTML      = buildSelect(lookupDesEsercizio, "IDdescrizioneEsercizio", "NomeEsercizio", document.getElementById("fTecDesEsercizio").value);

    document.getElementById("fTecSerieRef").innerHTML = buildSelect(lookupSerie, "IDserie", "Serie", null);
    GIORNI.forEach(g => {
      const sel = document.getElementById(`fTec_${g}`);
      const valoreAttuale = sel.value;
      sel.innerHTML = buildSelectSerie(valoreAttuale);
    });
  }
  else if (modalSezione === "stretching") {
    document.getElementById("fStrEsercizio").innerHTML = buildSelect(lookupStretching, "IDesercizioStretching", "NomeEsercizio", document.getElementById("fStrEsercizio").value);
  }
  else if (modalSezione === "allfisforres") {
    document.getElementById("fFRTabellaN").innerHTML   = buildSelect(lookupTabellaN,    "IDtabella_n", "NumeroTabella", document.getElementById("fFRTabellaN").value);
    document.getElementById("fFRDescrizione").innerHTML = buildSelect(lookupDesFisForRes, "IDdescrizioneEsercizioAllFisForRes", "DescrizioneEsercizio", document.getElementById("fFRDescrizione").value);
  }
  else if (modalSezione === "allfiscor") {
    document.getElementById("fCOAttrezzo").innerHTML    = buildSelect(lookupAttrezzi,  "IDattrezzo",                          "AttrezzoDes", document.getElementById("fCOAttrezzo").value);
    document.getElementById("fCODescrizione").innerHTML = buildSelect(lookupDesFisCor, "IDdescrizioneEsercizioAllFisCor",     "DescrizioneEsercizio", document.getElementById("fCODescrizione").value);
  }
}

async function promptAddLookup(endpointPath, isNumber = false) {
  const val = prompt(`Inserisci il nuovo valore:`);
  if (!val || !val.trim()) return;

  const url = `${API_URL}/allenamenti/lookup/${endpointPath}/`;
  const body = isNumber ? { numero: Number(val) } : { nome: val.trim() };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Errore nell'aggiunta del valore.");
      return;
    }
    await refreshOpenModalLookups();
  } catch {
    alert("Impossibile contattare il server.");
  }
}

// Come promptAddLookup, ma per Serie servono due valori (testo + numero frecce)
async function promptAddSerie() {
  const serieVal = prompt("Inserisci la serie (es. 6x12):");
  if (!serieVal || !serieVal.trim()) return;

  const numStr = prompt("Numero di frecce corrispondente (es. 72):");
  if (!numStr || !numStr.trim()) return;
  const numero_frecce = Number(numStr);
  if (!Number.isFinite(numero_frecce)) {
    alert("Numero frecce non valido.");
    return;
  }

  const url = `${API_URL}/allenamenti/lookup/serie/`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ serie: serieVal.trim(), numero_frecce })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Errore nell'aggiunta della serie.");
      return;
    }
    await refreshOpenModalLookups();
  } catch {
    alert("Impossibile contattare il server.");
  }
}

async function promptDeleteLookup(endpointPath, selectId) {
  const selectEl = document.getElementById(selectId);
  const val = selectEl.value;
  if (!val) {
    alert("Seleziona prima un elemento dalla tendina per eliminarlo.");
    return;
  }
  
  const text = selectEl.options[selectEl.selectedIndex].text;
  if (!confirm(`Sei sicuro di voler eliminare "${text}"?`)) return;

  const url = `${API_URL}/allenamenti/lookup/${endpointPath}/${val}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Errore nell'eliminazione o elemento già in uso in altre schede.");
      return;
    }
    selectEl.value = ""; // Resetta
    await refreshOpenModalLookups();
  } catch {
    alert("Impossibile contattare il server.");
  }
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────

window.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  if (!ID_ALLENAMENTO || !ID_ATLETA) {
    window.location.href = "../Dashboard.html";
    return;
  }

  const titolo = [NOME_ATLETA, COGNOME_ATLETA].filter(Boolean).join(" ");
  document.getElementById("titoloAtleta").textContent  = titolo || "—";
  document.getElementById("titoloAtleta2").textContent = titolo ? `Dettaglio Allenamento: ${titolo}` : "Dettaglio Allenamento";

  await caricaLookup();
  await caricaSeduteEsistenti();
});