const API_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
const params = new URLSearchParams(window.location.search);
const ID_ALLENAMENTO = Number(params.get("allenamento"));
const ID_ATLETA      = Number(params.get("atleta"));
const NOME_ATLETA    = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";

let settimanaCorrente = 1;
let sedutaCorrente    = 1;

// ─── Lookup cache ───
let lookupRiscaldamento  = [];
let lookupPosizionePiedi = [];
let lookupDistanza       = [];
let lookupTarga          = [];
let lookupDesEsercizio   = [];
let lookupStretching     = [];
let lookupTabellaN       = [];
let lookupDesFisForRes   = [];
let lookupAttrezzi       = [];
let lookupDesFisCor      = [];
let lookupSerie          = [];

// ─── Dati cache sezioni ───
let cacheRisc = [];
let cacheTec  = [];
let cacheStr  = [];
let cacheFor  = [];
let cacheCor  = [];

// ─── ESERCIZI ───
const ESERCIZI = {
  riscaldamento: ["Corsa leggera 3 minuti","Collo","Spalle","Braccia","Polsi","Mani","Tronco","Gambe","Corsa in salita due minuti"],
  posizionePiedi: ["PAUSA","A Terra","Tavoletta Inclinata","Materassino","Piedi Uniti","Tavoletta a Dondolo","Peso sui Talloni","Peso sulle Punte","Peso su Piede Destro","Peso su Piede Sinistro","Gymball","Sbilanciamento avanti","Sbilanciamento indietro","Postura Verticale","Peso su gamba arco","Peso su gamba corda","Piedi uniti","Piedi molto aperti","Piedi in Linea"],
  distanza: ["5","10","15","18","25","30","35","40","45","50","55","60","65","70","90"],
  targa: ["40","60","80","120","riga O","riga V","Croce","Tripla","Paglia","Spot 12","Spot B.F.","Spot 4","Spot 8","Spot 24"],
  tempo: ["-","1'","2'","3'","4'","5'","6'","7'","8'","9'","10'","11'","12'"],
  serie: [
    {serie:"6x12",frecce:72},{serie:"12x6",frecce:72},{serie:"20x3",frecce:60},{serie:"10x4",frecce:40},
    {serie:"3x12",frecce:36},{serie:"6x6",frecce:36},{serie:"12x3",frecce:36},{serie:"10x3",frecce:30},
    {serie:"2x12",frecce:24},{serie:"12x2",frecce:24},{serie:"6x3",frecce:18},{serie:"3x6",frecce:18},
    {serie:"6x2",frecce:12},{serie:"1x12",frecce:12},{serie:"2x6",frecce:12},{serie:"3x3",frecce:9},
    {serie:"6x1",frecce:6},{serie:"2x3",frecce:6},{serie:"1x6",frecce:6},{serie:"3x2",frecce:6},
    {serie:"3x1",frecce:3},{serie:"1x3",frecce:3}
  ],
  stretching: ["Collo","Spalle","Braccia","Polsi","Mani","Tronco","Gambe"],
  esercizioForza: ["Tab.1","Tab.2","Tab.3","Tab.4","Tab.5","Tab.6","Tab.7","Tab.8","Tab.9","Tab.10","Tab.11","Corsa in salita","Scatti","Corsa Leggera"],
  attrezzo: ["Tavola di Equilibrio","Gymball","Meduse"],
  ripetizioni: ["10 ripetizioni per esercizio","15 ripetizioni per esercizio","20 ripetizioni per esercizio"],
  descrizioneCoord: ["In piedi in equilibrio","Posizioni varie in equilibrio - 2' per posizione","Fare delle trazioni in equilibrio senza tirare","Fare delle trazioni in equilibrio tirando su bersaglio grande a 5 mt"],
  descrizioneEsercizi: [
    "G01-Simulazione mezza gara","G02-Volèe di Prova","G03-Simulazione gara",
    "T01-Al contatto al viso mira, espansione","T02-Allineamento spalle","T03-Bacino allineato al bersaglio",
    "T04-Bilanciamento peso su entrambi i piedi","T05-Controllo e mantenimento allineamento corda",
    "T06-Controllo postura","T07-Controllo Postura Verticale","T08-Controllo punta o diottra allineate al giallo",
    "T09-Controllo rilascio","T10-Durante la trazione focus sui muscoli dorsali",
    "T11-Eseguire la pre-trazione e trazione","T12-Focalizzare e mantenere lo sguardo al giallo",
    "T13-Focalizzare il giallo fino al completamento del tiro","T14-Focus alla linearità mano-polso-avambraccio",
    "T15-Focus mano della corda","T16-Focus mano dell'arco - 45° - rilassata",
    "T17-Focus mano dell'arco - Arco che scorre avanti","T18-Focus mano dell'arco - arco che sfugge",
    "T19-Focus postura e rilassamento spalle","T20-Focus Verticalità dell'arco",
    "T21-Mantenere l'elevazione del braccio dell'arco","T22-Mantenimento capo fermo",
    "T23-Mantenimento contatto stabile al viso","T24-Mantenimento posizione braccio dell'arco",
    "T25-Pausa 10\" e due profondi respiri ad ogni freccia","T26-Piedi allineati e paralleli",
    "T27-Pretrazione","T28-Rappresentazione Mentale dell'azione di tiro",
    "T29-Rilascio - Rilassamento mano della corda","T30-Rilassamento Spalle",
    "T31-Rotazione del gomito dell'arco verso l'esterno","T32-Sollevamento e orientamento arco al bersaglio",
    "T33-Trazione mantenendo dita alla corda","T34-Trazione mantenendo punta o diottra sul giallo",
    "T35-\"5 passi\"","T36-Focus Equilibrio",
    "F01-Raggiungere i contatti al viso e mantenere la trazione per 10\"",
    "F02-Raggiungere i contatti al viso e mantenere la trazione per 7\"",
    "F03-Raggiungere i contatti al viso - controllo dorsale 10\"",
    "F04-Raggiungere i contatti al viso - controllo dorsale 15\"",
    "F05-Raggiungere i contatti al viso - controllo dorsale 5\"",
    "F06-Trazione con elastico - 1 V.sosta","F07-Trazione con elastico - 2 V.sosta",
    "F08-Trazione con elastico - 3 V.sosta","F09-Raggiungere i contatti - trazione 5\"",
    "P01-5' di PAUSA","P02-10' di PAUSA","P03-15' di PAUSA",
    "TA01-Focus mano della corda dal setup al rilascio","TA02-Focus mano dell'arco dal setup al rilascio",
    "TA03-Pin diottra sulla X","TA04-Qui e ora (mindfullness)","TA05-Simulazione gara segnando punti",
    "TA06-Spot","TA07-Spot preso o mancato","TA08-Tavoletta inclinata usando tutti e quattro i lati",
    "TA09-Completare la trazione coinvolgendo i muscoli dorsali","TA10-Conteggio punti e Impatti",
    "TA11-Conteggio punti eliminando la freccia peggiore","TA12-Controllo allineamento corda - Conteggio punti",
    "TA13-Controllo postura e contatti","TA14-Espansione con elastico (aiutato)",
    "TA15-Espansione - controllo tensione dorsale","TA16-Tempi accorciati","TA17-Tempi di esecuzione allungati",
    "Scarico"
  ]
};

const GIORNI_KEYS = ["lunedi","martedi","mercoledi","giovedi","venerdi","sabato","domenica"];

// ─── Auth ───
function getToken() { return localStorage.getItem("access_token"); }
function authHeaders() { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }

function requireAuth() {
  const token = getToken();
  if (!token) { location.href = "../Autenticazione/Istruttore.html"; return false; }
  try {
    const p = JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
    if (p.ruolo !== "istruttore") { localStorage.clear(); location.href = "../Autenticazione/Istruttore.html"; return false; }
    return true;
  } catch { location.href = "../Autenticazione/Istruttore.html"; return false; }
}

function tornaAllenamenti() {
  const q = new URLSearchParams({ atleta: ID_ATLETA, nome: NOME_ATLETA, cognome: COGNOME_ATLETA });
  location.href = `Allenamenti.html?${q}`;
}

// ─── Helpers ───
function escHtml(s) {
  if (s == null) return "";
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function strToNull(v) {
  return (v === "" || v == null) ? null : v;
}

function makeOpts(arr, selected) {
  let h = `<option value="">▼ Seleziona</option>`;
  arr.forEach(v => { h += `<option value="${escHtml(v)}"${v===selected?" selected":""}>${escHtml(v)}</option>`; });
  return h;
}
function makeOptsWithEmpty(arr, selected, emptyLabel="—") {
  let h = `<option value="">${emptyLabel}</option>`;
  arr.forEach(v => { h += `<option value="${escHtml(v)}"${v===selected?" selected":""}>${escHtml(v)}</option>`; });
  return h;
}

// ─── Debounce save ───
const saveTimers = new WeakMap();
function debSave(tr, fn, delay=900) {
  if (saveTimers.has(tr)) clearTimeout(saveTimers.get(tr));
  saveTimers.set(tr, setTimeout(() => fn(tr), delay));
}

// ─── Lookup config ───
const LCFG = {
  riscaldamento:  { arr:()=>lookupRiscaldamento,  idK:"IDesercizioRiscaldamento",              nameK:"NomeEsercizio",          ep:"riscaldamento",            bodyFn:v=>({nome:v}) },
  posizionePiedi: { arr:()=>lookupPosizionePiedi, idK:"IDposizionePiedi",                      nameK:"NomePosizione",          ep:"posizione-piedi",          bodyFn:v=>({nome:v}) },
  distanza:       { arr:()=>lookupDistanza,        idK:"IDdistanza",                            nameK:"NomeEsercizio",          ep:"distanza",                 bodyFn:v=>({nome:v}) },
  targa:          { arr:()=>lookupTarga,           idK:"IDtarga",                               nameK:"NomeTarga",              ep:"targa",                    bodyFn:v=>({nome:v}) },
  desEsercizio:   { arr:()=>lookupDesEsercizio,    idK:"IDdescrizioneEsercizio",                nameK:"NomeEsercizio",          ep:"descrizione-esercizio",    bodyFn:v=>({nome:v}) },
  stretching:     { arr:()=>lookupStretching,      idK:"IDesercizioStretching",                 nameK:"NomeEsercizio",          ep:"stretching",               bodyFn:v=>({nome:v}) },
  tabellaN:       { arr:()=>lookupTabellaN,        idK:"IDtabella_n",                           nameK:"NumeroTabella",          ep:"tabella-numero",           bodyFn:v=>({numero:parseTabellaNum(v)}) },
  desFisForRes:   { arr:()=>lookupDesFisForRes,    idK:"IDdescrizioneEsercizioAllFisForRes",    nameK:"DescrizioneEsercizio",   ep:"allfisforres-descrizione", bodyFn:v=>({nome:v}) },
  attrezzi:       { arr:()=>lookupAttrezzi,        idK:"IDattrezzo",                            nameK:"AttrezzoDes",            ep:"attrezzi",                 bodyFn:v=>({nome:v}) },
  desFisCor:      { arr:()=>lookupDesFisCor,       idK:"IDdescrizioneEsercizioAllFisCor",       nameK:"DescrizioneEsercizio",   ep:"allfiscor-descrizione",    bodyFn:v=>({nome:v}) },
};

function parseTabellaNum(text) {
  if (!text) return null;
  const m = String(text).match(/Tab\.(\d+)/i);
  if (m) return parseInt(m[1]);
  const map = {"Corsa in salita":101,"Scatti":102,"Corsa Leggera":103};
  return map[text] ?? 200;
}
function tabellaNumToText(n) {
  if (!n && n !== 0) return "";
  if (n <= 99) return `Tab.${n}`;
  const rev = {101:"Corsa in salita",102:"Scatti",103:"Corsa Leggera"};
  return rev[n] ?? `Tab.${n}`;
}

async function findOrCreateId(cfgKey, text) {
  if (!text) return null;
  const cfg = LCFG[cfgKey];

  if (cfgKey === "tabellaN") {
    const num = parseTabellaNum(text);
    if (num == null) return null;
    let found = lookupTabellaN.find(x => Number(x.NumeroTabella) === num);
    if (found) return found[cfg.idK];
    try {
      const res = await fetch(`${API_URL}/allenamenti/lookup/${cfg.ep}/`,
        { method: "POST", headers: authHeaders(), body: JSON.stringify(cfg.bodyFn(text)) });
      if (res.ok) {
        await caricaLookup();
        found = lookupTabellaN.find(x => Number(x.NumeroTabella) === num);
        return found ? found[cfg.idK] : null;
      }
    } catch {}
    return null;
  }

  let found = cfg.arr().find(x => (x[cfg.nameK] || "").toLowerCase() === text.toLowerCase());
  if (found) return found[cfg.idK];

  try {
    const res = await fetch(`${API_URL}/allenamenti/lookup/${cfg.ep}/`,
      { method: "POST", headers: authHeaders(), body: JSON.stringify(cfg.bodyFn(text)) });
    if (res.ok) {
      await caricaLookup();
      found = cfg.arr().find(x => (x[cfg.nameK] || "").toLowerCase() === text.toLowerCase());
      return found ? found[cfg.idK] : null;
    }
  } catch {}
  return null;
}

// ─── Lookup loading ───
async function caricaLookupSingle(ep, setter) {
  try {
    const r = await fetch(`${API_URL}/allenamenti/lookup/${ep}/`, { headers: authHeaders() });
    if (r.ok) setter(await r.json());
  } catch {}
}

async function caricaLookup() {
  await Promise.all([
    caricaLookupSingle("riscaldamento",           d => { lookupRiscaldamento  = d; }),
    caricaLookupSingle("posizione-piedi",          d => { lookupPosizionePiedi = d; }),
    caricaLookupSingle("distanza",                 d => { lookupDistanza       = d; }),
    caricaLookupSingle("targa",                    d => { lookupTarga          = d; }),
    caricaLookupSingle("descrizione-esercizio",    d => { lookupDesEsercizio   = d; }),
    caricaLookupSingle("stretching",               d => { lookupStretching     = d; }),
    caricaLookupSingle("tabella-numero",           d => { lookupTabellaN       = d; }),
    caricaLookupSingle("allfisforres-descrizione", d => { lookupDesFisForRes   = d; }),
    caricaLookupSingle("attrezzi",                 d => { lookupAttrezzi       = d; }),
    caricaLookupSingle("allfiscor-descrizione",    d => { lookupDesFisCor      = d; }),
    caricaLookupSingle("serie",                    d => { lookupSerie          = d; }),
  ]);
  refreshRiscDropdown();
}

function refreshRiscDropdown() {
  const sel = document.getElementById("riscDropdown");
  if (!sel) return;
  const backendNames = lookupRiscaldamento.map(l => l.NomeEsercizio);
  const all = [...new Set([...ESERCIZI.riscaldamento, ...backendNames])];
  const prev = sel.value;
  sel.innerHTML = `<option value="">▼ Esercizi</option>`;
  all.forEach(v => { sel.innerHTML += `<option value="${escHtml(v)}">${escHtml(v)}</option>`; });
  sel.value = prev;
}

// ─── Carica seduta ───
async function caricaSeduta() {
  settimanaCorrente = parseInt(document.getElementById("settimanaInput").value) || 1;
  sedutaCorrente    = parseInt(document.getElementById("sedutaInput").value) || 1;

  // Inizializza seduta se non esiste
  try {
    await fetch(
      `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/sedute/${sedutaCorrente}/inizializza`,
      { method: "POST", headers: authHeaders(), body: "{}" }
    );
  } catch {}

  await Promise.all([
    fetchSezione("riscaldamento"),
    fetchSezione("tecforcor"),
    fetchSezione("stretching"),
    fetchSezione("allfisforres"),
    fetchSezione("allfiscor"),
    fetchNota(),
  ]);
  aggiornaTotaleFrecce();
}

async function fetchSezione(sez) {
  const url = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/sedute/${sedutaCorrente}/${sez}/`;
  try {
    const r = await fetch(url, { headers: authHeaders() });
    if (!r.ok) return;
    const d = await r.json();
    if (sez === "riscaldamento") { cacheRisc = d; renderRisc(); }
    if (sez === "tecforcor")     { cacheTec  = d; renderTec();  }
    if (sez === "stretching")    { cacheStr  = d; renderStr();  }
    if (sez === "allfisforres")  { cacheFor  = d; renderFor();  }
    if (sez === "allfiscor")     { cacheCor  = d; renderCor();  }
  } catch {}
}

async function aggiornaTotaleFrecce() {
  const url = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/sedute/${sedutaCorrente}/tecforcor/totale-frecce`;
  try {
    const r = await fetch(url, { headers: authHeaders() });
    if (!r.ok) return;
    const t = await r.json();
    const el = document.getElementById("totaleFrecce");
    if (el) el.textContent = t.totale ?? 0;
    const map = {fLun:"lunedi",fMar:"martedi",fMer:"mercoledi",fGio:"giovedi",fVen:"venerdi",fSab:"sabato",fDom:"domenica"};
    Object.entries(map).forEach(([id,k]) => {
      const e = document.getElementById(id);
      if (e) e.textContent = t[k] ?? 0;
    });
  } catch {}
}

async function fetchNota() {
  try {
    const r = await fetch(
      `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/nota/`,
      { headers: authHeaders() }
    );
    if (!r.ok) return;
    const d = await r.json();
    const el = document.getElementById("noteAtleta");
    if (el) el.value = d?.nota || "";
  } catch {}
}

async function salvaNota() {
  const nota = strToNull(document.getElementById("noteAtleta").value.trim());
  const msgEl = document.getElementById("notaMsg");
  try {
    const r = await fetch(
      `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/nota/`,
      { method: "POST", headers: authHeaders(), body: JSON.stringify({ nota }) }
    );
    msgEl.textContent = r.ok ? "Salvato ✓" : "Errore";
    msgEl.className = "msg-inline " + (r.ok ? "ok" : "err");
    msgEl.style.display = "inline";
    setTimeout(() => { msgEl.style.display = "none"; }, 2000);
  } catch {}
}

// ─── DELETE ───
async function eliminaRiga(sez, id, refreshFn) {
  if (!confirm("Eliminare questa riga?")) return;
  const base = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/sedute/${sedutaCorrente}`;
  try {
    const r = await fetch(`${base}/${sez}/${id}`, { method: "DELETE", headers: authHeaders() });
    if (r.ok || r.status === 204) {
      await refreshFn();
      if (sez === "tecforcor") aggiornaTotaleFrecce();
    } else {
      alert("Errore nell'eliminazione.");
    }
  } catch { alert("Impossibile contattare il server."); }
}

// ═══════════════════════════
//  RISCALDAMENTO
// ═══════════════════════════
function renderRisc() {
  const tbody = document.getElementById("riscRows");
  const cont  = document.getElementById("riscContainer");
  tbody.innerHTML = "";
  if (!cacheRisc.length) { cont.style.display = "none"; return; }
  cont.style.display = "block";
  cacheRisc.forEach(row => {
    const nome = lookupRiscaldamento.find(l => l.IDesercizioRiscaldamento === row.id_esercizio_riscaldamento)?.NomeEsercizio || "—";
    const tr = document.createElement("tr");
    tr.classList.add("new-row");
    tr.dataset.id = row.IDdetRiscaldamento;
    tr.innerHTML = `<td style="text-align:left;padding-left:12px;">${escHtml(nome)}</td>
      <td><button class="delete-row">×</button></td>`;
    tr.querySelector(".delete-row").addEventListener("click", () =>
      eliminaRiga("riscaldamento", row.IDdetRiscaldamento, () => fetchSezione("riscaldamento"))
    );
    tbody.appendChild(tr);
  });
}

async function aggiungiRisc(nome) {
  if (!nome) return;
  const id = await findOrCreateId("riscaldamento", nome);
  const base = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/sedute/${sedutaCorrente}`;
  try {
    const r = await fetch(`${base}/riscaldamento/`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({
        id_esercizio_riscaldamento: id,
        lunedi: null, martedi: null, mercoledi: null,
        giovedi: null, venerdi: null, sabato: null, domenica: null
      })
    });
    if (r.ok) await fetchSezione("riscaldamento");
    else alert("Errore nell'aggiunta.");
  } catch {}
  document.getElementById("riscDropdown").value = "";
}

// ═══════════════════════════
//  TECNICA-FORZA-COORDINAZIONE
// ═══════════════════════════
function renderTec() {
  const tbody = document.getElementById("tecRows");
  tbody.innerHTML = "";
  cacheTec.forEach(row => tbody.appendChild(creaRigaTec(row)));
  tbody.appendChild(creaRigaTecVuota());
}

function buildListesTec() {
  return {
    allPos: [...new Set([...ESERCIZI.posizionePiedi, ...lookupPosizionePiedi.map(l => l.NomePosizione)])],
    allDis: [...new Set([...ESERCIZI.distanza,       ...lookupDistanza.map(l => l.NomeEsercizio)])],
    allTrg: [...new Set([...ESERCIZI.targa,           ...lookupTarga.map(l => l.NomeTarga)])],
    allDes: [...new Set([...ESERCIZI.descrizioneEsercizi, ...lookupDesEsercizio.map(l => l.NomeEsercizio)])],
  };
}

function creaRigaTec(row) {
  const { allPos, allDis, allTrg, allDes } = buildListesTec();
  const posTxt = lookupPosizionePiedi.find(l => l.IDposizionePiedi === row.id_posizione_piedi)?.NomePosizione || "";
  const disTxt = lookupDistanza.find(l => l.IDdistanza === row.id_distanza)?.NomeEsercizio || "";
  const trgTxt = lookupTarga.find(l => l.IDtarga === row.id_targa)?.NomeTarga || "";
  const desTxt = lookupDesEsercizio.find(l => l.IDdescrizioneEsercizio === row.id_descrizione_esercizio)?.NomeEsercizio || "";

  const serieCells = GIORNI_KEYS.map(g => {
    const val = row[g] || "";
    return `<td><div class="serie-cell${val ? " has-value" : " empty-val"}" data-day="${g}" data-val="${escHtml(val)}">${val ? escHtml(val) : "-"}</div></td>`;
  }).join("");

  const tr = document.createElement("tr");
  tr.classList.add("new-row");
  tr.dataset.id = String(row.IDdetTecForCor);
  tr.innerHTML = `
    <td><select class="dropdown-grid" data-col="piedi">${makeOpts(allPos, posTxt)}</select></td>
    <td><select class="dropdown-grid" data-col="distanza">${makeOpts(allDis, disTxt)}</select></td>
    <td><select class="dropdown-grid" data-col="targa">${makeOpts(allTrg, trgTxt)}</select></td>
    ${serieCells}
    <td><span class="icon-cell" style="cursor:pointer;" title="Apri serie">📋</span></td>
    <td><select class="dropdown-grid" data-col="descrizione" style="min-width:140px;">${makeOpts(allDes, desTxt)}</select></td>
    <td><button class="delete-row">×</button></td>`;
  setupTecListeners(tr);
  return tr;
}

function creaRigaTecVuota() {
  const { allPos, allDis, allTrg, allDes } = buildListesTec();
  const serieCells = GIORNI_KEYS.map(g =>
    `<td><div class="serie-cell empty-val" data-day="${g}" data-val="">-</div></td>`
  ).join("");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><select class="dropdown-grid" data-col="piedi">${makeOpts(allPos, "")}</select></td>
    <td><select class="dropdown-grid" data-col="distanza">${makeOpts(allDis, "")}</select></td>
    <td><select class="dropdown-grid" data-col="targa">${makeOpts(allTrg, "")}</select></td>
    ${serieCells}
    <td><span class="icon-cell" style="cursor:pointer;" title="Apri serie">📋</span></td>
    <td><select class="dropdown-grid" data-col="descrizione" style="min-width:140px;">${makeOpts(allDes, "")}</select></td>
    <td><button class="delete-row">×</button></td>`;
  setupTecListeners(tr);
  return tr;
}

function setupTecListeners(tr) {
  tr.querySelectorAll("select.dropdown-grid").forEach(sel =>
    sel.addEventListener("change", () => debSave(tr, salvaTec))
  );
  tr.querySelectorAll(".serie-cell").forEach(cell =>
    cell.addEventListener("click", () => apriSerieModal(cell))
  );
  tr.querySelector(".icon-cell").addEventListener("click", () =>
    apriSerieModal(tr.querySelector(".serie-cell"))
  );
  tr.querySelector(".delete-row").addEventListener("click", () => {
    if (tr.dataset.id) eliminaRiga("tecforcor", tr.dataset.id, () => fetchSezione("tecforcor"));
    else tr.remove();
  });
}

async function salvaTec(tr) {
  const piedi = tr.querySelector('[data-col="piedi"]').value;
  const dist  = tr.querySelector('[data-col="distanza"]').value;
  const targa = tr.querySelector('[data-col="targa"]').value;
  const des   = tr.querySelector('[data-col="descrizione"]').value;

  const giorni = {};
  GIORNI_KEYS.forEach(g => {
    const cell = tr.querySelector(`[data-day="${g}"]`);
    giorni[g] = strToNull(cell ? cell.dataset.val : "");
  });

  const [idPos, idDis, idTrg, idDes] = await Promise.all([
    findOrCreateId("posizionePiedi", piedi),
    findOrCreateId("distanza", dist),
    findOrCreateId("targa", targa),
    findOrCreateId("desEsercizio", des),
  ]);

  const body = {
    id_posizione_piedi: idPos,
    id_distanza: idDis,
    id_targa: idTrg,
    id_descrizione_esercizio: idDes,
    ...giorni
  };

  const base = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/sedute/${sedutaCorrente}`;
  const idRiga = tr.dataset.id || "";

  try {
    const r = await fetch(
      idRiga ? `${base}/tecforcor/${idRiga}` : `${base}/tecforcor/`,
      { method: idRiga ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(body) }
    );
    if (r.ok && !idRiga) {
      const newId = await r.json();
      tr.dataset.id = String(newId.IDdetTecForCor);
      const tbody = tr.closest("tbody");
      if (tbody?.lastElementChild?.dataset.id) tbody.appendChild(creaRigaTecVuota());
    }
    aggiornaTotaleFrecce();
  } catch {}
}

// ═══════════════════════════
//  STRETCHING
// ═══════════════════════════
function renderStr() {
  const tbody = document.getElementById("strRows");
  tbody.innerHTML = "";
  cacheStr.forEach(row => tbody.appendChild(creaRigaStr(row)));
  tbody.appendChild(creaRigaStrVuota());
}

function buildListeStr() {
  return [...new Set([...ESERCIZI.stretching, ...lookupStretching.map(l => l.NomeEsercizio)])];
}

function creaRigaStr(row) {
  const allEs = buildListeStr();
  const nomEs = lookupStretching.find(l => l.IDesercizioStretching === row.id_esercizio_stretching)?.NomeEsercizio || "";
  const giorniCells = GIORNI_KEYS.map(g =>
    `<td><select class="dropdown-grid" data-col="${g}">${makeOptsWithEmpty(ESERCIZI.tempo, row[g] || "", "—")}</select></td>`
  ).join("");
  const tr = document.createElement("tr");
  tr.classList.add("new-row");
  tr.dataset.id = String(row.IDdetStretching);
  tr.innerHTML = `
    <td style="padding-left:6px;"><select class="dropdown-grid" data-col="esercizio" style="min-width:100px;">${makeOpts(allEs, nomEs)}</select></td>
    ${giorniCells}
    <td><button class="delete-row">×</button></td>`;
  setupStrListeners(tr);
  return tr;
}

function creaRigaStrVuota() {
  const allEs = buildListeStr();
  const giorniCells = GIORNI_KEYS.map(g =>
    `<td><select class="dropdown-grid" data-col="${g}">${makeOptsWithEmpty(ESERCIZI.tempo, "", "—")}</select></td>`
  ).join("");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td style="padding-left:6px;"><select class="dropdown-grid" data-col="esercizio" style="min-width:100px;">${makeOpts(allEs, "")}</select></td>
    ${giorniCells}
    <td><button class="delete-row">×</button></td>`;
  setupStrListeners(tr);
  return tr;
}

function setupStrListeners(tr) {
  tr.querySelectorAll("select").forEach(sel =>
    sel.addEventListener("change", () => debSave(tr, salvaStr))
  );
  tr.querySelector(".delete-row").addEventListener("click", () => {
    if (tr.dataset.id) eliminaRiga("stretching", tr.dataset.id, () => fetchSezione("stretching"));
    else tr.remove();
  });
}

async function salvaStr(tr) {
  const esNome = strToNull(tr.querySelector('[data-col="esercizio"]')?.value || "");
  const giorni = {};
  GIORNI_KEYS.forEach(g => {
    giorni[g] = strToNull(tr.querySelector(`[data-col="${g}"]`)?.value || "");
  });

  const idEs = esNome ? await findOrCreateId("stretching", esNome) : null;
  const body = { id_esercizio_stretching: idEs, ...giorni };

  const base = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/sedute/${sedutaCorrente}`;
  const idRiga = tr.dataset.id || "";
  try {
    const r = await fetch(
      idRiga ? `${base}/stretching/${idRiga}` : `${base}/stretching/`,
      { method: idRiga ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(body) }
    );
    if (r.ok && !idRiga) {
      const newId = await r.json();
      tr.dataset.id = String(newId.IDdetStretching);
      const tbody = tr.closest("tbody");
      if (tbody?.lastElementChild?.dataset.id) tbody.appendChild(creaRigaStrVuota());
    }
  } catch {}
}

// ═══════════════════════════
//  ALLENAMENTO FISICO FORZA RESISTENZA
// ═══════════════════════════
function renderFor() {
  const tbody = document.getElementById("forRows");
  tbody.innerHTML = "";
  cacheFor.forEach(row => tbody.appendChild(creaRigaFor(row)));
  tbody.appendChild(creaRigaForVuota());
}

function buildListeFor() {
  return {
    allTab: [...new Set([...ESERCIZI.esercizioForza, ...lookupTabellaN.map(l => tabellaNumToText(l.NumeroTabella)).filter(Boolean)])],
    allDes: [...new Set([...ESERCIZI.ripetizioni,     ...lookupDesFisForRes.map(l => l.DescrizioneEsercizio)])],
  };
}

function creaRigaFor(row) {
  const { allTab, allDes } = buildListeFor();
  const tabEntry = lookupTabellaN.find(l => l.IDtabella_n === row.id_tabella_n);
  const tabTxt = tabEntry ? tabellaNumToText(tabEntry.NumeroTabella) : "";
  const desTxt = lookupDesFisForRes.find(l => l.IDdescrizioneEsercizioAllFisForRes === row.id_descrizione_esercizio_all_fis_for_res)?.DescrizioneEsercizio || "";
  const giorniCells = GIORNI_KEYS.map(g =>
    `<td><select class="dropdown-grid" data-col="${g}">${makeOptsWithEmpty(ESERCIZI.tempo, row[g] || "", "—")}</select></td>`
  ).join("");
  const tr = document.createElement("tr");
  tr.classList.add("new-row");
  tr.dataset.id = String(row.IDdetAllFisForRes);
  tr.innerHTML = `
    <td><select class="dropdown-grid" data-col="tabella">${makeOpts(allTab, tabTxt)}</select></td>
    ${giorniCells}
    <td><select class="dropdown-grid" data-col="descrizione" style="min-width:140px;">${makeOpts(allDes, desTxt)}</select></td>
    <td><button class="delete-row">×</button></td>`;
  setupForListeners(tr);
  return tr;
}

function creaRigaForVuota() {
  const { allTab, allDes } = buildListeFor();
  const giorniCells = GIORNI_KEYS.map(g =>
    `<td><select class="dropdown-grid" data-col="${g}">${makeOptsWithEmpty(ESERCIZI.tempo, "", "—")}</select></td>`
  ).join("");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><select class="dropdown-grid" data-col="tabella">${makeOpts(allTab, "")}</select></td>
    ${giorniCells}
    <td><select class="dropdown-grid" data-col="descrizione" style="min-width:140px;">${makeOpts(allDes, "")}</select></td>
    <td><button class="delete-row">×</button></td>`;
  setupForListeners(tr);
  return tr;
}

function setupForListeners(tr) {
  tr.querySelectorAll("select").forEach(sel =>
    sel.addEventListener("change", () => debSave(tr, salvaFor))
  );
  tr.querySelector(".delete-row").addEventListener("click", () => {
    if (tr.dataset.id) eliminaRiga("allfisforres", tr.dataset.id, () => fetchSezione("allfisforres"));
    else tr.remove();
  });
}

async function salvaFor(tr) {
  const tabTxt = tr.querySelector('[data-col="tabella"]').value;
  const desTxt = tr.querySelector('[data-col="descrizione"]').value;
  const giorni = {};
  GIORNI_KEYS.forEach(g => {
    giorni[g] = strToNull(tr.querySelector(`[data-col="${g}"]`)?.value || "");
  });

  const [idTab, idDes] = await Promise.all([
    findOrCreateId("tabellaN", tabTxt),
    findOrCreateId("desFisForRes", desTxt),
  ]);
  const body = { id_tabella_n: idTab, id_descrizione_esercizio_all_fis_for_res: idDes, ...giorni };

  const base = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/sedute/${sedutaCorrente}`;
  const idRiga = tr.dataset.id || "";
  try {
    const r = await fetch(
      idRiga ? `${base}/allfisforres/${idRiga}` : `${base}/allfisforres/`,
      { method: idRiga ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(body) }
    );
    if (r.ok && !idRiga) {
      const newId = await r.json();
      tr.dataset.id = String(newId.IDdetAllFisForRes);
      const tbody = tr.closest("tbody");
      if (tbody?.lastElementChild?.dataset.id) tbody.appendChild(creaRigaForVuota());
    }
  } catch {}
}

// ═══════════════════════════
//  ALLENAMENTO FISICO COORDINAZIONE
// ═══════════════════════════
function renderCor() {
  const tbody = document.getElementById("corRows");
  tbody.innerHTML = "";
  cacheCor.forEach(row => tbody.appendChild(creaRigaCor(row)));
  tbody.appendChild(creaRigaCorVuota());
}

function buildListeCor() {
  return {
    allAtt: [...new Set([...ESERCIZI.attrezzo,         ...lookupAttrezzi.map(l => l.AttrezzoDes)])],
    allDes: [...new Set([...ESERCIZI.descrizioneCoord, ...lookupDesFisCor.map(l => l.DescrizioneEsercizio)])],
  };
}

function creaRigaCor(row) {
  const { allAtt, allDes } = buildListeCor();
  const attTxt = lookupAttrezzi.find(l => l.IDattrezzo === row.id_attrezzo)?.AttrezzoDes || "";
  const desTxt = lookupDesFisCor.find(l => l.IDdescrizioneEsercizioAllFisCor === row.id_descrizione_esercizio_all_fis_cor)?.DescrizioneEsercizio || "";
  const giorniCells = GIORNI_KEYS.map(g =>
    `<td><select class="dropdown-grid" data-col="${g}">${makeOptsWithEmpty(ESERCIZI.tempo, row[g] || "", "—")}</select></td>`
  ).join("");
  const tr = document.createElement("tr");
  tr.classList.add("new-row");
  tr.dataset.id = String(row.IDdetAllFisCor);
  tr.innerHTML = `
    <td><select class="dropdown-grid" data-col="attrezzo">${makeOpts(allAtt, attTxt)}</select></td>
    ${giorniCells}
    <td><select class="dropdown-grid" data-col="descrizione" style="min-width:140px;">${makeOpts(allDes, desTxt)}</select></td>
    <td><button class="delete-row">×</button></td>`;
  setupCorListeners(tr);
  return tr;
}

function creaRigaCorVuota() {
  const { allAtt, allDes } = buildListeCor();
  const giorniCells = GIORNI_KEYS.map(g =>
    `<td><select class="dropdown-grid" data-col="${g}">${makeOptsWithEmpty(ESERCIZI.tempo, "", "—")}</select></td>`
  ).join("");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><select class="dropdown-grid" data-col="attrezzo">${makeOpts(allAtt, "")}</select></td>
    ${giorniCells}
    <td><select class="dropdown-grid" data-col="descrizione" style="min-width:140px;">${makeOpts(allDes, "")}</select></td>
    <td><button class="delete-row">×</button></td>`;
  setupCorListeners(tr);
  return tr;
}

function setupCorListeners(tr) {
  tr.querySelectorAll("select").forEach(sel =>
    sel.addEventListener("change", () => debSave(tr, salvaCor))
  );
  tr.querySelector(".delete-row").addEventListener("click", () => {
    if (tr.dataset.id) eliminaRiga("allfiscor", tr.dataset.id, () => fetchSezione("allfiscor"));
    else tr.remove();
  });
}

async function salvaCor(tr) {
  const attTxt = tr.querySelector('[data-col="attrezzo"]').value;
  const desTxt = tr.querySelector('[data-col="descrizione"]').value;
  const giorni = {};
  GIORNI_KEYS.forEach(g => {
    giorni[g] = strToNull(tr.querySelector(`[data-col="${g}"]`)?.value || "");
  });

  const [idAtt, idDes] = await Promise.all([
    findOrCreateId("attrezzi", attTxt),
    findOrCreateId("desFisCor", desTxt),
  ]);
  const body = { id_attrezzo: idAtt, id_descrizione_esercizio_all_fis_cor: idDes, ...giorni };

  const base = `${API_URL}/allenamenti/${ID_ALLENAMENTO}/settimane/${settimanaCorrente}/sedute/${sedutaCorrente}`;
  const idRiga = tr.dataset.id || "";
  try {
    const r = await fetch(
      idRiga ? `${base}/allfiscor/${idRiga}` : `${base}/allfiscor/`,
      { method: idRiga ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(body) }
    );
    if (r.ok && !idRiga) {
      const newId = await r.json();
      tr.dataset.id = String(newId.IDdetAllFisCor);
      const tbody = tr.closest("tbody");
      if (tbody?.lastElementChild?.dataset.id) tbody.appendChild(creaRigaCorVuota());
    }
  } catch {}
}

// ═══════════════════════════
//  MODAL SERIE
// ═══════════════════════════
let activeSerieCella = null;

function apriSerieModal(cella) {
  activeSerieCella = cella;
  const listEl = document.getElementById("serieList");
  listEl.innerHTML = "";

  const serieMap = new Map();
  ESERCIZI.serie.forEach(s => serieMap.set(s.serie, s.frecce));
  lookupSerie.forEach(s => serieMap.set(s.Serie, s.NumeroFrecce));

  serieMap.forEach((frecce, nome) => {
    const div = document.createElement("div");
    div.className = "serie-item";
    div.innerHTML = `
      <div class="serie-name-box">${escHtml(nome)}</div>
      <div class="serie-frecce-box">${frecce} frecce</div>
      <button class="serie-pick-btn">✓</button>`;
    div.querySelector(".serie-pick-btn").addEventListener("click", () => scegliSerie(nome));
    div.querySelector(".serie-name-box").addEventListener("click", () => scegliSerie(nome));
    listEl.appendChild(div);
  });

  document.getElementById("serieModal").classList.add("active");
}

function scegliSerie(val) {
  if (!activeSerieCella) return;
  activeSerieCella.textContent = val || "-";
  activeSerieCella.dataset.val = val || "";
  activeSerieCella.classList.toggle("has-value", !!val);
  activeSerieCella.classList.toggle("empty-val", !val);
  document.getElementById("serieModal").classList.remove("active");
  const tr = activeSerieCella.closest("tr");
  if (tr) debSave(tr, salvaTec, 100);
  activeSerieCella = null;
}

// ═══════════════════════════
//  MODAL LISTA DATI
// ═══════════════════════════
let activeListKey = null;

const LIST_CONFIG = {
  riscaldamento:     { arr: () => lookupRiscaldamento,  idK: "IDesercizioRiscaldamento",           nameK: "NomeEsercizio",        ep: "riscaldamento",            bodyFn: v => ({ nome: v }) },
  posizionePiedi:    { arr: () => lookupPosizionePiedi, idK: "IDposizionePiedi",                   nameK: "NomePosizione",        ep: "posizione-piedi",          bodyFn: v => ({ nome: v }) },
  distanza:          { arr: () => lookupDistanza,        idK: "IDdistanza",                         nameK: "NomeEsercizio",        ep: "distanza",                 bodyFn: v => ({ nome: v }) },
  targa:             { arr: () => lookupTarga,           idK: "IDtarga",                            nameK: "NomeTarga",            ep: "targa",                    bodyFn: v => ({ nome: v }) },
  serie:             { arr: () => lookupSerie,           idK: "IDserie",                            nameK: "Serie",                ep: "serie",                    bodyFn: v => {
    const parts = v.split("|");
    return { serie: parts[0].trim(), numero_frecce: Number(parts[1]) || 0 };
  }, isSerie: true },
  stretching:        { arr: () => lookupStretching,      idK: "IDesercizioStretching",              nameK: "NomeEsercizio",        ep: "stretching",               bodyFn: v => ({ nome: v }) },
  esercizioForza:    { arr: () => lookupTabellaN,        idK: "IDtabella_n",                        nameK: "NumeroTabella",        ep: "tabella-numero",           bodyFn: v => ({ numero: parseTabellaNum(v) }), isForza: true },
  ripetizioni:       { arr: () => lookupDesFisForRes,    idK: "IDdescrizioneEsercizioAllFisForRes", nameK: "DescrizioneEsercizio", ep: "allfisforres-descrizione", bodyFn: v => ({ nome: v }) },
  attrezzo:          { arr: () => lookupAttrezzi,        idK: "IDattrezzo",                         nameK: "AttrezzoDes",          ep: "attrezzi",                 bodyFn: v => ({ nome: v }) },
  descrizioneCoord:  { arr: () => lookupDesFisCor,       idK: "IDdescrizioneEsercizioAllFisCor",    nameK: "DescrizioneEsercizio", ep: "allfiscor-descrizione",    bodyFn: v => ({ nome: v }) },
  descrizioneEsercizi: { arr: () => lookupDesEsercizio, idK: "IDdescrizioneEsercizio",             nameK: "NomeEsercizio",        ep: "descrizione-esercizio",    bodyFn: v => ({ nome: v }) },
};

function apriListModal(listKey, title) {
  activeListKey = listKey;
  document.getElementById("listModalTitle").textContent = "📋 " + title;
  document.getElementById("listAddInput").value = "";
  document.getElementById("listAddMsg").style.display = "none";
  renderListContent(listKey);
  document.getElementById("listModal").classList.add("active");
}

function renderListContent(listKey) {
  const cfg = LIST_CONFIG[listKey];
  if (!cfg) return;
  const cont = document.getElementById("listContent");
  cont.innerHTML = "";
  const arr = cfg.arr();
  if (!arr.length) {
    cont.innerHTML = `<div style="color:#555;font-size:13px;text-align:center;padding:12px;">Nessun elemento</div>`;
    return;
  }
  arr.forEach((item, idx) => {
    let label;
    if (cfg.isSerie)  label = `${item.Serie} (${item.NumeroFrecce} frecce)`;
    else if (cfg.isForza) label = tabellaNumToText(item.NumeroTabella);
    else label = item[cfg.nameK] || "—";

    const wrap = document.createElement("div");
    wrap.className = "data-list-item-wrapper";
    wrap.innerHTML = `
      <div class="item-number">${idx + 1}</div>
      <div class="data-list-item">${escHtml(label)}</div>
      <button class="item-delete-btn" title="Elimina">×</button>`;
    wrap.querySelector(".item-delete-btn").addEventListener("click", async () => {
      if (!confirm(`Eliminare "${label}"?`)) return;
      try {
        const r = await fetch(`${API_URL}/allenamenti/lookup/${cfg.ep}/${item[cfg.idK]}`,
          { method: "DELETE", headers: authHeaders() });
        if (r.ok || r.status === 204) {
          await caricaLookup();
          renderListContent(listKey);
        } else {
          alert("Errore: elemento probabilmente in uso.");
        }
      } catch { alert("Impossibile contattare il server."); }
    });
    cont.appendChild(wrap);
  });
}

async function aggiungiVoceListModal() {
  const cfg = LIST_CONFIG[activeListKey];
  if (!cfg) return;
  const input = document.getElementById("listAddInput");
  const msgEl = document.getElementById("listAddMsg");
  const val = input.value.trim();
  if (!val) return;

  try {
    const r = await fetch(`${API_URL}/allenamenti/lookup/${cfg.ep}/`,
      { method: "POST", headers: authHeaders(), body: JSON.stringify(cfg.bodyFn(val)) });
    if (r.ok) {
      input.value = "";
      msgEl.textContent = "Aggiunto ✓";
      msgEl.style.color = "#4caf50";
      msgEl.style.display = "block";
      setTimeout(() => { msgEl.style.display = "none"; }, 1500);
      await caricaLookup();
      renderListContent(activeListKey);
    } else {
      const e = await r.json().catch(() => ({}));
      msgEl.textContent = e.detail || "Errore";
      msgEl.style.color = "#e91e63";
      msgEl.style.display = "block";
    }
  } catch {
    msgEl.textContent = "Impossibile contattare il server.";
    msgEl.style.color = "#e91e63";
    msgEl.style.display = "block";
  }
}

// ═══════════════════════════
//  INIT
// ═══════════════════════════
window.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  if (!ID_ALLENAMENTO || !ID_ATLETA) { location.href = "Dashboard.html"; return; }

  // Atleta
  const titolo = [NOME_ATLETA, COGNOME_ATLETA].filter(Boolean).join(" ");
  const atletaEl = document.getElementById("atletaInput");
  if (atletaEl) atletaEl.value = titolo || "—";

  // Close
  document.getElementById("closeBtn").addEventListener("click", tornaAllenamenti);

  // Carica
  document.getElementById("btnCarica").addEventListener("click", caricaSeduta);
  document.getElementById("settimanaInput").addEventListener("keydown", e => {
    if (e.key === "Enter") caricaSeduta();
  });

  // + Riga buttons
  document.getElementById("btnAddTec").addEventListener("click", () => {
    const tbody = document.getElementById("tecRows");
    if (!tbody.lastElementChild || tbody.lastElementChild.dataset.id) {
      tbody.appendChild(creaRigaTecVuota());
    }
  });
  document.getElementById("btnAddStr").addEventListener("click", () => {
    const tbody = document.getElementById("strRows");
    if (!tbody.lastElementChild || tbody.lastElementChild.dataset.id) {
      tbody.appendChild(creaRigaStrVuota());
    }
  });
  document.getElementById("btnAddFor").addEventListener("click", () => {
    const tbody = document.getElementById("forRows");
    if (!tbody.lastElementChild || tbody.lastElementChild.dataset.id) {
      tbody.appendChild(creaRigaForVuota());
    }
  });
  document.getElementById("btnAddCor").addEventListener("click", () => {
    const tbody = document.getElementById("corRows");
    if (!tbody.lastElementChild || tbody.lastElementChild.dataset.id) {
      tbody.appendChild(creaRigaCorVuota());
    }
  });

  // Riscaldamento dropdown
  document.getElementById("riscDropdown").addEventListener("change", e => aggiungiRisc(e.target.value));

  // Note
  document.getElementById("btnSalvaNota").addEventListener("click", salvaNota);

  // Serie modal
  document.getElementById("serieModalClose").addEventListener("click", () => {
    document.getElementById("serieModal").classList.remove("active");
    activeSerieCella = null;
  });
  document.getElementById("serieClear").addEventListener("click", () => scegliSerie(""));
  document.getElementById("serieModal").addEventListener("click", e => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.remove("active");
      activeSerieCella = null;
    }
  });

  // List modal
  document.getElementById("listModalClose").addEventListener("click", () =>
    document.getElementById("listModal").classList.remove("active")
  );
  document.getElementById("listAddBtn").addEventListener("click", aggiungiVoceListModal);
  document.getElementById("listAddInput").addEventListener("keydown", e => {
    if (e.key === "Enter") aggiungiVoceListModal();
  });
  document.getElementById("listModal").addEventListener("click", e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("active");
  });

  // Delegated: open list modal (📋 icons in header)
  document.addEventListener("click", e => {
    const el = e.target.closest(".open-list-modal");
    if (el) apriListModal(el.dataset.list, el.dataset.title);
  });

  // Carica lookup e poi seduta
  await caricaLookup();
  await caricaSeduta();
});
