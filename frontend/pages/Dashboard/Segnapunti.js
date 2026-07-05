const API_URL = "http://localhost:8000";

const params = new URLSearchParams(window.location.search);
const ID_ATLETA = Number(params.get("atleta"));
const NOME_ATLETA = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";

let segnapuntiCache = [];
let segnapuntoCorrente = null;
let mezzaAttiva = 1;

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
  if (!token) { window.location.href = "../Autenticazione/Istruttore.html"; return false; }
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.ruolo !== "istruttore") {
      localStorage.clear();
      window.location.href = "../Autenticazione/Istruttore.html";
      return false;
    }
    return true;
  } catch { window.location.href = "../Autenticazione/Istruttore.html"; return false; }
}

function tornaDashboard() { window.location.href = "Dashboard.html"; }

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("currentUser");
  window.location.href = "../Autenticazione/Istruttore.html";
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

// ─── Lista sessioni ───────────────────────────────────────

async function caricaSegnapunti() {
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/segnapunti/`, {
      headers: authHeaders(),
    });
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
        <button class="btn btn-sm btn-red" data-delete="${s.IDsegnapunto}">Elimina</button>
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

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const s = segnapuntiCache.find((x) => x.IDsegnapunto === Number(btn.dataset.delete));
      if (s) openDeleteModal(s);
    });
  });
}

// ─── Crea sessione ────────────────────────────────────────

function openAddModal() {
  clearMsg("formMsgBox");
  document.getElementById("fData").value = new Date().toISOString().slice(0, 10);
  document.getElementById("fDistanza").value = "18m";
  document.getElementById("fFrecce").value = "3";
  openModal("formModal");
}

async function creaSessione() {
  clearMsg("formMsgBox");
  const data = document.getElementById("fData").value;
  const distanza = document.getElementById("fDistanza").value;
  const frecce_per_volee = Number(document.getElementById("fFrecce").value);

  if (!data) {
    showMsg("formMsgBox", "La data è obbligatoria.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/segnapunti/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ data, distanza, frecce_per_volee }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("formMsgBox", err.detail || "Errore nella creazione.", "error");
      return;
    }
    closeModal("formModal");
    await caricaSegnapunti();
  } catch {
    showMsg("formMsgBox", "Impossibile contattare il server.", "error");
  }
}

// ─── Elimina ──────────────────────────────────────────────

function openDeleteModal(s) {
  document.getElementById("deleteId").value = s.IDsegnapunto;
  document.getElementById("deleteMsg").textContent =
    `Eliminare la sessione del ${formatDate(s.data)} a ${s.distanza}?`;
  openModal("deleteModal");
}

async function confermaElimina() {
  const id = document.getElementById("deleteId").value;
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/segnapunti/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      alert("Errore nell'eliminazione.");
      return;
    }
    closeModal("deleteModal");
    await caricaSegnapunti();
  } catch {
    alert("Impossibile contattare il server.");
  }
}

// ─── Score ────────────────────────────────────────────────

async function apriScore(s) {
  segnapuntoCorrente = s;

  document.getElementById("listaSezione").style.display = "none";
  document.getElementById("scoreSezione").style.display = "block";
  document.getElementById("scoreTitolo").textContent =
    `${formatDate(s.data)} — ${s.distanza} — ${s.frecce_per_volee} frecce/volée`;

  document.getElementById("noteIstruttore").value = s.note_istruttore || "";
  document.getElementById("noteAtleta").value = s.note_atleta || "";

  // mostra/nasconde colonne f4-f6 in base a frecce_per_volee
  const sei = s.frecce_per_volee === 6;
  ["thF4", "thF5", "thF6"].forEach((id) => {
    document.getElementById(id).style.display = sei ? "" : "none";
  });

  // isInit = true evita il salvataggio automatico durante l'apertura
  await switchMezza(1, true);
  await caricaEDisegnaVolee();
}

function chiudiScore() {
  segnapuntoCorrente = null;
  document.getElementById("scoreSezione").style.display = "none";
  document.getElementById("listaSezione").style.display = "block";
  document.getElementById("totaleFinalBox").style.display = "none";
}

// Nuova funzione asincrona con salvataggio automatico
async function switchMezza(m, isInit = false) {
  // Se clicco sulla mezza già attiva, ignoro (tranne durante l'init)
  if (mezzaAttiva === m && !isInit) return;

  // Se non stiamo semplicemente aprendo la pagina per la prima volta,
  // esegui un salvataggio della mezza corrente PRIMA di cambiare scheda.
  if (!isInit && segnapuntoCorrente) {
    await salvaVolee(true); // Passiamo true per un salvataggio "silenzioso"
  }

  mezzaAttiva = m;
  const tab1 = document.getElementById("tab1");
  const tab2 = document.getElementById("tab2");
  
  if (tab1) tab1.className = "mezza-tab" + (m === 1 ? " active" : "");
  if (tab2) tab2.className = "mezza-tab" + (m === 2 ? " active" : "");
  
  // Ricarica i dati salvati della nuova mezza dal server
  if (!isInit) {
    await caricaEDisegnaVolee();
  } else {
    disegnaTabella();
  }
}

let voleeData = {};

async function caricaEDisegnaVolee() {
  voleeData = {};
  try {
    const res = await fetch(
      `${API_URL}/atleti/${ID_ATLETA}/segnapunti/${segnapuntoCorrente.IDsegnapunto}/volee/`,
      { headers: authHeaders() }
    );
    if (res.ok) {
      const rows = await res.json();
      rows.forEach((r) => {
        voleeData[`${r.mezza}-${r.numero}`] = r;
      });
    }
  } catch { /* ignora, la tabella sarà vuota */ }
  disegnaTabella();
  aggiornaTotaleFinale();
}

function punti(v) {
  if (!v || v === "M") return 0;
  if (v === "X") return 10;
  const n = parseInt(v);
  return isNaN(n) ? 0 : n;
}

function disegnaTabella() {
  const tbody = document.getElementById("scoreBody");
  tbody.innerHTML = "";
  const s = segnapuntoCorrente;
  const fpv = s.frecce_per_volee;

  let totaleProgressivo = 0;
  if (mezzaAttiva === 2) {
    for (let n = 1; n <= 10; n++) {
      const key = `1-${n}`;
      if (voleeData[key]) totaleProgressivo += (voleeData[key].somma || 0);
    }
  }

  for (let n = 1; n <= 10; n++) {
    const key = `${mezzaAttiva}-${n}`;
    const saved = voleeData[key] || {};

    const tr = document.createElement("tr");
    let celleFrecce = "";
    for (let i = 1; i <= 6; i++) {
      const val = saved[`f${i}`] || "";
      const hidden = i > fpv ? "style='display:none;'" : "";
      celleFrecce += `<td ${hidden}>
        <input class="freccia" id="f-${mezzaAttiva}-${n}-${i}"
               value="${val}" maxlength="2"
               autocomplete="off"
               oninput="onFrecciaInput(${mezzaAttiva},${n})" />
      </td>`;
    }

    const sommaRiga = saved.somma ?? "";
    const totRiga = saved.totale ?? "";

    tr.innerHTML = `
      <td class="num">${n}</td>
      ${celleFrecce}
      <td class="somma" id="somma-${mezzaAttiva}-${n}">${sommaRiga}</td>
      <td class="totale" id="totale-${mezzaAttiva}-${n}">${totRiga}</td>
      <td class="contatori" id="c10-${mezzaAttiva}-${n}"></td>
      <td class="contatori" id="cX-${mezzaAttiva}-${n}"></td>
    `;
    tbody.appendChild(tr);
  }

  const trTot = document.createElement("tr");
  trTot.className = "totale-row";
  const colFrecce = fpv === 6 ? 6 : 3;
  trTot.innerHTML = `
    <td colspan="${1 + colFrecce}">TOTALE MEZZA ${mezzaAttiva}</td>
    <td class="somma" id="totMezza-somma"></td>
    <td class="totale" id="totMezza-totale"></td>
    <td class="contatori" id="totMezza-10"></td>
    <td class="contatori" id="totMezza-X"></td>
  `;
  tbody.appendChild(trTot);

  aggiornaRighe();
}

function onFrecciaInput(mezza, numero) {
  aggiornaRighe();
}

function aggiornaRighe() {
  const s = segnapuntoCorrente;
  const fpv = s.frecce_per_volee;

  let totProg = 0;
  if (mezzaAttiva === 2) {
    for (let n = 1; n <= 10; n++) {
      const key = `1-${n}`;
      if (voleeData[key]) totProg += (voleeData[key].somma || 0);
    }
  }

  let sommaMezza = 0;
  let tot10 = 0;
  let totX = 0;

  for (let n = 1; n <= 10; n++) {
    const vals = [];
    for (let i = 1; i <= fpv; i++) {
      const inp = document.getElementById(`f-${mezzaAttiva}-${n}-${i}`);
      vals.push(inp ? inp.value.trim().toUpperCase() : "");
    }
    const somma = vals.reduce((acc, v) => acc + punti(v), 0);
    totProg += somma;
    sommaMezza += somma;
    const cnt10 = vals.filter((v) => v === "10").length;
    const cntX  = vals.filter((v) => v === "X").length;
    tot10 += cnt10;
    totX  += cntX;

    const cellSomma = document.getElementById(`somma-${mezzaAttiva}-${n}`);
    const cellTotale = document.getElementById(`totale-${mezzaAttiva}-${n}`);
    const cell10 = document.getElementById(`c10-${mezzaAttiva}-${n}`);
    const cellX  = document.getElementById(`cX-${mezzaAttiva}-${n}`);
    if (cellSomma) cellSomma.textContent = somma || "0";
    if (cellTotale) cellTotale.textContent = totProg || "0";
    if (cell10) cell10.textContent = cnt10 || "0";
    if (cellX)  cellX.textContent  = cntX  || "0";
  }

  const totSomma  = document.getElementById("totMezza-somma");
  const totTotale = document.getElementById("totMezza-totale");
  const tot10El   = document.getElementById("totMezza-10");
  const totXEl    = document.getElementById("totMezza-X");
  if (totSomma)  totSomma.textContent  = sommaMezza;
  if (totTotale) totTotale.textContent = totProg;
  if (tot10El)   tot10El.textContent   = tot10;
  if (totXEl)    totXEl.textContent    = totX;
}

function aggiornaTotaleFinale() {
  let tot = 0;
  let t10 = 0;
  let tX  = 0;
  for (let m = 1; m <= 2; m++) {
    for (let n = 1; n <= 10; n++) {
      const key = `${m}-${n}`;
      const r = voleeData[key];
      if (r) {
        tot += r.somma || 0;
        const fpv = segnapuntoCorrente.frecce_per_volee;
        for (let i = 1; i <= fpv; i++) {
          if (r[`f${i}`] === "10") t10++;
          if (r[`f${i}`] === "X")  tX++;
        }
      }
    }
  }
  const box = document.getElementById("totaleFinalBox");
  box.textContent = `Totale Complessivo: ${tot} — 10: ${t10} — X: ${tX}`;
  box.style.display = tot > 0 ? "block" : "none";
}

// ─── Salva volée ─────────────────────────────────────────

async function salvaVolee(silenzioso = false) {
  if (!silenzioso) clearMsg("scoreMsgBox");
  const s = segnapuntoCorrente;
  const fpv = s.frecce_per_volee;
  const volee = [];

  for (let n = 1; n <= 10; n++) {
    const obj = { mezza: mezzaAttiva, numero: n };
    for (let i = 1; i <= fpv; i++) {
      const inp = document.getElementById(`f-${mezzaAttiva}-${n}-${i}`);
      obj[`f${i}`] = inp ? (inp.value.trim().toUpperCase() || null) : null;
    }
    for (let i = fpv + 1; i <= 6; i++) obj[`f${i}`] = null;
    volee.push(obj);
  }

  try {
    const res = await fetch(
      `${API_URL}/atleti/${ID_ATLETA}/segnapunti/${s.IDsegnapunto}/volee/`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(volee),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (!silenzioso) showMsg("scoreMsgBox", err.detail || "Errore nel salvataggio.", "error");
      return;
    }
    // Ricarica per consolidare i dati (tranne se è in background)
    if (!silenzioso) {
      await caricaEDisegnaVolee();
      showMsg("scoreMsgBox", "Tabella salvata con successo.", "success");
    }
  } catch {
    if (!silenzioso) showMsg("scoreMsgBox", "Impossibile contattare il server.", "error");
  }
}

// ─── Salva note ──────────────────────────────────────────

async function salvaNoteCorrente() {
  const note_istruttore = document.getElementById("noteIstruttore").value.trim() || null;
  const note_atleta = document.getElementById("noteAtleta").value.trim() || null;
  const s = segnapuntoCorrente;

  try {
    const res = await fetch(
      `${API_URL}/atleti/${ID_ATLETA}/segnapunti/${s.IDsegnapunto}`,
      {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ note_istruttore, note_atleta }),
      }
    );
    if (!res.ok) {
      alert("Errore nel salvataggio delle note.");
      return;
    }
    segnapuntoCorrente.note_istruttore = note_istruttore;
    segnapuntoCorrente.note_atleta = note_atleta;
    showMsg("scoreMsgBox", "Note aggiornate.", "success");
  } catch {
    alert("Impossibile contattare il server.");
  }
}

// ─── Init ────────────────────────────────────────────────

// ─── Init ────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  if (!ID_ATLETA) { window.location.href = "Dashboard.html"; return; }
  
  const nomeCompleto = [NOME_ATLETA, COGNOME_ATLETA].filter(Boolean).join(" ");
  
  // 1. Scrive nel titolo principale grande e bianco (es. "Segnapunti: Mario Rossi")
  const t = document.getElementById("titoloAtleta");
  if (t) {
    t.textContent = nomeCompleto ? `Segnapunti: ${nomeCompleto}` : "Segnapunti atleta";
  }
  
  // 2. Scrive nella barra di navigazione in alto a sinistra
  const tNav = document.getElementById("titoloAtletaNav");
  if (tNav) {
    tNav.textContent = nomeCompleto || "—";
  }
  
  caricaSegnapunti();
});