const API_URL = "http://localhost:8000";

const params = new URLSearchParams(window.location.search);
const ID_ATLETA = Number(params.get("atleta"));
const NOME_ATLETA = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";

let segnapuntiCache = [];
let segnapuntoCorrente = null;
let mezzaAttiva = 1;
let voleeData = {}; // Stato globale in memoria delle volée correnti
let impattiBersaglio = []; // Tiri correnti sul bersaglio (sincronizzati con l'iframe)

// ─── Helper Funzioni ─────────────────────────────────────

function getToken() { return localStorage.getItem("access_token"); }

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
  } catch { window.location.href = "../../Autenticazione/Istruttore.html"; return false; }
}

function tornaDashboard() { window.location.href = "../Dashboard.html"; }

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("currentUser");
  window.location.href = "../../Autenticazione/Istruttore.html";
}

function showMsg(id, testo, tipo) {
  const box = document.getElementById(id);
  if (!box) return;
  box.textContent = testo;
  box.className = "msg-box " + tipo;
}

function clearMsg(id) {
  const box = document.getElementById(id);
  if (box) box.className = "msg-box";
}

function setTxt(id, testo) {
  const el = document.getElementById(id);
  if (el) el.textContent = testo;
}

function openModal(id) { document.getElementById(id).classList.add("open"); }

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  clearMsg("formMsgBox");
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("it-IT");
}

function punti(v) {
  if (!v || v === "M") return 0;
  if (v === "X") return 10;
  const n = parseInt(v);
  return isNaN(n) ? 0 : n;
}

// ─── Lista sessioni ───────────────────────────────────────

async function caricaSegnapunti() {
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/segnapunti/`, { headers: authHeaders() });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) {
      showMsg("pageMsgBox", "Errore nel caricamento delle sessioni.", "error");
      return;
    }
    segnapuntiCache = await res.json();
    renderLista();
  } catch {
    showMsg("pageMsgBox", "Impossibile contattare il server.", "error");
  }
}

function renderLista() {
  const list = document.getElementById("segnapuntiList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  if (!segnapuntiCache.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  segnapuntiCache.forEach((s) => {
    const card = document.createElement("div");
    card.className = "materiale-card";
    card.innerHTML = `
      <div>
        <div class="materiale-data">${formatDate(s.data)} — ${s.distanza}</div>
        <span class="materiale-badge" style="background:#276749;">${s.frecce_per_volee} frecce/volée</span>
      </div>
      <div class="materiale-summary">
        <span><strong>Distanza:</strong> ${s.distanza}</span>
        <span><strong>Data:</strong> ${formatDate(s.data)}</span>
        <span><strong>Note istruttore:</strong> ${s.note_istruttore || "—"}</span>
      </div>
      <div class="materiale-actions">
        <button class="btn btn-sm btn-outline" data-apri="${s.IDsegnapunto}">Apri segnapunti</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-apri]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const s = segnapuntiCache.find((x) => x.IDsegnapunto === Number(btn.dataset.apri));
      if (s) apriScore(s);
    });
  });
}

// ─── Score Gestione Tabella ───────────────────────────────

async function apriScore(s) {
  if (!segnapuntoCorrente || segnapuntoCorrente.IDsegnapunto !== s.IDsegnapunto) {
    voleeData = {};
  }
  segnapuntoCorrente = s;

  document.getElementById("listaSezione").style.display = "none";
  document.getElementById("scoreSezione").style.display = "block";
  document.getElementById("scoreTitolo").textContent = `${formatDate(s.data)} — ${s.distanza} — ${s.frecce_per_volee} frecce/volée`;

  document.getElementById("noteIstruttore").value = s.note_istruttore || "";
  document.getElementById("noteAtleta").value = s.note_atleta || "";

  const sei = s.frecce_per_volee === 6;
  ["thF4", "thF5", "thF6"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = sei ? "" : "none";
  });

  impattiBersaglio = s.ImpattiBersaglio || [];
  inviaHitsAllIframe();

  switchMezza(1, true);
  await caricaEDisegnaVolee();
}

async function salvaNoteIstruttore() {
  if (!segnapuntoCorrente) return;
  const note_istruttore = document.getElementById("noteIstruttore").value.trim() || null;

  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/segnapunti/${segnapuntoCorrente.IDsegnapunto}/note`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ note_istruttore }),
    });

    if (res.status === 401) { logout(); return; }
    if (!res.ok) {
      showMsg("scoreMsgBox", "Errore nel salvataggio delle note istruttore.", "error");
      return;
    }

    segnapuntoCorrente.note_istruttore = note_istruttore;
    showMsg("scoreMsgBox", "Note istruttore salvate con successo!", "success");
    setTimeout(() => clearMsg("scoreMsgBox"), 3000);
  } catch {
    showMsg("scoreMsgBox", "Impossibile contattare il server.", "error");
  }
}

function chiudiScore() {
  segnapuntoCorrente = null;
  voleeData = {}; // Svuota la memoria locale: le modifiche non salvate spariscono!
  impattiBersaglio = [];
  document.getElementById("scoreSezione").style.display = "none";
  document.getElementById("listaSezione").style.display = "block";
  document.getElementById("totaleFinalBox").style.display = "none";
}

// ─── Bersaglio interattivo (widget in iframe) ─────────────

function inviaHitsAllIframe() {
  const frame = document.getElementById("bersaglioFrame");
  if (frame) {
    frame.contentWindow.postMessage({ type: "bersaglio-load", hits: impattiBersaglio }, "*");
  }
}

window.addEventListener("message", (evt) => {
  if (evt.data && evt.data.type === "bersaglio-hits") {
    impattiBersaglio = evt.data.hits || [];
  }
});

function switchMezza(m, isInit = false) {
  if (mezzaAttiva === m && !isInit) return;

  mezzaAttiva = m;
  ["tab1", "tab2"].forEach((id, idx) => {
    const tab = document.getElementById(id);
    if (tab) tab.className = "mezza-tab" + (m === (idx + 1) ? " active" : "");
  });
  
  // Ridisegna semplicemente la tabella basandosi sulla memoria locale corrente
  disegnaTabella();
}

async function caricaEDisegnaVolee() {
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/segnapunti/${segnapuntoCorrente.IDsegnapunto}/volee/`, { headers: authHeaders() });
    if (res.ok) {
      const rows = await res.json();
      voleeData = {}; 
      rows.forEach((r) => {
        voleeData[`${r.mezza}-${r.numero}`] = r;
      });
    }
  } catch { /* In caso di offline, mantiene i dati temporanei correnti */ }
  
  disegnaTabella();
}

function disegnaTabella() {
  const tbody = document.getElementById("scoreBody");
  if (!tbody || !segnapuntoCorrente) return;
  tbody.innerHTML = "";
  
  const fpv = segnapuntoCorrente.frecce_per_volee;

  for (let n = 1; n <= 10; n++) {
    const key = `${mezzaAttiva}-${n}`;
    const saved = voleeData[key] || {};
    const tr = document.createElement("tr");
    
    let celleFrecce = "";
    for (let i = 1; i <= 6; i++) {
      const val = saved[`f${i}`] || "";
      const hidden = i > fpv ? "style='display:none;'" : "";
      celleFrecce += `
        <td ${hidden}>
          <input class="freccia" id="f-${mezzaAttiva}-${n}-${i}"
                 value="${val}" maxlength="2" autocomplete="off"
                 readonly />
        </td>`;
    }

    tr.innerHTML = `
      <td class="num">${n}</td>
      ${celleFrecce}
      <td class="somma" id="somma-${mezzaAttiva}-${n}">0</td>
      <td class="totale" id="totale-${mezzaAttiva}-${n}">0</td>
      <td class="contatori" id="c10-${mezzaAttiva}-${n}">0</td>
      <td class="contatori" id="cX-${mezzaAttiva}-${n}">0</td>
    `;
    tbody.appendChild(tr);
  }

  const trTot = document.createElement("tr");
  trTot.className = "totale-row";
  trTot.innerHTML = `
    <td colspan="${1 + fpv}">TOTALE TURNO ${mezzaAttiva}</td>
    <td class="somma" id="totMezza-somma">0</td>
    <td class="totale" id="totMezza-totale">0</td>
    <td class="contatori" id="totMezza-10">0</td>
    <td class="contatori" id="totMezza-X">0</td>
  `;
  tbody.appendChild(trTot);

  aggiornaRighe();
}

function aggiornaRighe() {
  if (!segnapuntoCorrente) return;
  const fpv = segnapuntoCorrente.frecce_per_volee;

  let totProg = 0;
  // Se siamo nella seconda metà, recuperiamo il progressivo della prima metà
  if (mezzaAttiva === 2) {
    for (let n = 1; n <= 10; n++) {
      const key = `1-${n}`;
      if (voleeData[key]) totProg += (voleeData[key].somma || 0);
    }
  }

  let sommaMezza = 0, tot10 = 0, totX = 0;

  for (let n = 1; n <= 10; n++) {
    const key = `${mezzaAttiva}-${n}`;
    const vals = [];
    
    if (!voleeData[key]) {
      voleeData[key] = { mezza: mezzaAttiva, numero: n };
    }
    
    // Legge i valori in tempo reale dal DOM e aggiorna lo stato locale 'voleeData'
    for (let i = 1; i <= 6; i++) {
      if (i <= fpv) {
        const inp = document.getElementById(`f-${mezzaAttiva}-${n}-${i}`);
        const val = inp ? inp.value.trim().toUpperCase() : "";
        vals.push(val);
        voleeData[key][`f${i}`] = val || null;
      } else {
        voleeData[key][`f${i}`] = null;
      }
    }

    const somma = vals.reduce((acc, v) => acc + punti(v), 0);
    totProg += somma;
    sommaMezza += somma;
    
    voleeData[key].somma = somma;
    voleeData[key].totale = totProg;

    const cnt10 = vals.filter((v) => v === "10").length;
    const cntX  = vals.filter((v) => v === "X").length;
    tot10 += cnt10;
    totX  += cntX;

    setTxt(`somma-${mezzaAttiva}-${n}`, somma);
    setTxt(`totale-${mezzaAttiva}-${n}`, totProg);
    setTxt(`c10-${mezzaAttiva}-${n}`, cnt10);
    setTxt(`cX-${mezzaAttiva}-${n}`, cntX);
  }

  setTxt("totMezza-somma", sommaMezza);
  setTxt("totMezza-totale", totProg);
  setTxt("totMezza-10", tot10);
  setTxt("totMezza-X", totX);

  aggiornaTotaleFinale();
}

function aggiornaTotaleFinale() {
  if (!segnapuntoCorrente) return;
  let tot = 0, t10 = 0, tX = 0;
  const fpv = segnapuntoCorrente.frecce_per_volee;

  for (let m = 1; m <= 2; m++) {
    for (let n = 1; n <= 10; n++) {
      const r = voleeData[`${m}-${n}`];
      if (r) {
        tot += r.somma || 0;
        for (let i = 1; i <= fpv; i++) {
          if (r[`f${i}`] === "10") t10++;
          if (r[`f${i}`] === "X")  tX++;
        }
      }
    }
  }
  const box = document.getElementById("totaleFinalBox");
  if (box) {
    box.textContent = `Totale Complessivo: ${tot} — 10: ${t10} — X: ${tX}`;
    box.style.display = tot > 0 ? "block" : "none";
  }
}

// ─── Init ────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  if (!ID_ATLETA) { window.location.href = "../Dashboard.html"; return; }
  
  const nomeCompleto = [NOME_ATLETA, COGNOME_ATLETA].filter(Boolean).join(" ");
  
  const t = document.getElementById("titoloAtleta");
  if (t) t.textContent = nomeCompleto ? `Segnapunti: ${nomeCompleto}` : "Segnapunti atleta";
  
  const tNav = document.getElementById("titoloAtletaNav");
  if (tNav) tNav.textContent = nomeCompleto || "—";
  
  caricaSegnapunti();
});