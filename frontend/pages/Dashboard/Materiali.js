const API_URL = "http://localhost:8000";

const params = new URLSearchParams(window.location.search);
const ID_ATLETA = Number(params.get("atleta"));
const NOME_ATLETA = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";

let materialiCache = [];

const FIELD_IDS = [
  ["fRiser", "riser"], ["fLunghezzaRiser", "lunghezza_riser"], ["fFlettenti", "flettenti"],
  ["fLunghezzaFlettenti", "lunghezza_flettenti"], ["fPotenzaNominale", "potenza_nominale"],
  ["fRest", "rest"], ["fMirino", "mirino"], ["fStabilizzazione", "stabilizzazione"],
  ["fAste", "aste"], ["fLunghezzaAste", "lunghezza_aste"], ["fPunte", "punte"],
  ["fPesoPunte", "peso_punte"], ["fCocche", "cocche"], ["fAlette", "alette"],
  ["fLunghezzaAlette", "lunghezza_alette"], ["fSpine", "spine"], ["fCorda", "corda"],
  ["fFili", "fili"], ["fPatella", "patella"], ["fBottone", "bottone"], ["fMolla", "molla"],
  ["fTillerSuperiore", "tiller_superiore"], ["fTillerInferiore", "tiller_inferiore"],
  ["fBrace", "brace"], ["fAllungo", "allungo"], ["fPotenzaReale", "potenza_reale"],
  ["fPuntoIncocco", "punto_incocco"],
];

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
  if (!token) {
    window.location.href = "../Autenticazione/Istruttore.html";
    return false;
  }
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.ruolo !== "istruttore") {
      localStorage.clear();
      window.location.href = "../Autenticazione/Istruttore.html";
      return false;
    }
    return true;
  } catch {
    window.location.href = "../Autenticazione/Istruttore.html";
    return false;
  }
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("currentUser");
  window.location.href = "../Autenticazione/Istruttore.html";
}

function escHtml(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("it-IT");
}

function toInputDate(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
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

function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  clearMsg("formMsgBox");
}

function readForm() {
  const dati = {
    data: document.getElementById("fData").value,
    materiale_corrente: document.getElementById("fMaterialeCorrente").checked,
  };
  FIELD_IDS.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (key === "fili") {
      const v = el.value.trim();
      dati.fili = v === "" ? null : Number(v);
    } else {
      const v = el.value.trim();
      dati[key] = v || null;
    }
  });
  return dati;
}

function fillForm(m) {
  document.getElementById("fData").value = toInputDate(m.data);
  document.getElementById("fMaterialeCorrente").checked = !!m.materiale_corrente;
  FIELD_IDS.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.value = m[key] ?? "";
  });
}

function clearForm() {
  document.getElementById("editMaterialeId").value = "";
  document.getElementById("fData").value = new Date().toISOString().slice(0, 10);
  document.getElementById("fMaterialeCorrente").checked = false;
  FIELD_IDS.forEach(([id]) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

async function caricaMateriali() {
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/materiali/`, {
      headers: authHeaders(),
    });
    if (res.status === 401) {
      logout();
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("pageMsgBox", err.detail || "Errore nel caricamento.", "error");
      return;
    }
    materialiCache = await res.json();
    renderList();
    document.getElementById("btnStampa").style.display = "inline-block";
  } catch {
    showMsg("pageMsgBox", "Impossibile contattare il server.", "error");
  }
}

function renderList() {
  const list = document.getElementById("materialiList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  if (!materialiCache.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  materialiCache.forEach((m) => {
    const card = document.createElement("div");
    card.className = "materiale-card" + (m.materiale_corrente ? " in-uso" : "");
    card.innerHTML = `
      <div>
        <div class="materiale-data">${formatDate(m.data)}</div>
        ${m.materiale_corrente ? '<span class="materiale-badge">In uso</span>' : ""}
      </div>
      <div class="materiale-summary">
        <span><strong>Riser:</strong> ${escHtml(m.riser) || "—"}</span>
        <span><strong>Flettenti:</strong> ${escHtml(m.flettenti) || "—"}</span>
        <span><strong>Mirino:</strong> ${escHtml(m.mirino) || "—"}</span>
        <span><strong>Corda:</strong> ${escHtml(m.corda) || "—"}</span>
        <span><strong>Potenza:</strong> ${escHtml(m.potenza_reale || m.potenza_nominale) || "—"}</span>
        <span><strong>Punte:</strong> ${escHtml(m.punte) || "—"}</span>
      </div>
      <div class="materiale-actions">
        <button class="btn btn-sm btn-outline" type="button" data-edit="${m.IDmateriale}">Modifica</button>
        <button class="btn btn-sm btn-red" type="button" data-delete="${m.IDmateriale}">Elimina</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const m = materialiCache.find((x) => x.IDmateriale === Number(btn.dataset.edit));
      if (m) openEditModal(m);
    });
  });

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const m = materialiCache.find((x) => x.IDmateriale === Number(btn.dataset.delete));
      if (m) openDeleteModal(m);
    });
  });
}

function openAddModal() {
  clearMsg("formMsgBox");
  clearForm();
  document.getElementById("formModalPill").textContent = "Nuovo Materiale";
  document.getElementById("formModalTitle").textContent = "Aggiungi configurazione";
  openModal("formModal");
}

function openEditModal(m) {
  clearMsg("formMsgBox");
  document.getElementById("editMaterialeId").value = m.IDmateriale;
  fillForm(m);
  document.getElementById("formModalPill").textContent = "Modifica";
  document.getElementById("formModalTitle").textContent = "Modifica configurazione";
  openModal("formModal");
}

function openDeleteModal(m) {
  document.getElementById("deleteMaterialeId").value = m.IDmateriale;
  document.getElementById("deleteMsg").textContent =
    `Eliminare la configurazione del ${formatDate(m.data)}?`;
  openModal("deleteModal");
}

async function salvaMateriale() {
  clearMsg("formMsgBox");
  const dati = readForm();
  if (!dati.data) {
    showMsg("formMsgBox", "La data è obbligatoria.", "error");
    return;
  }

  const id = document.getElementById("editMaterialeId").value;
  const isEdit = !!id;
  const url = isEdit
    ? `${API_URL}/atleti/${ID_ATLETA}/materiali/${id}`
    : `${API_URL}/atleti/${ID_ATLETA}/materiali/`;

  try {
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(dati),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("formMsgBox", err.detail || "Errore nel salvataggio.", "error");
      return;
    }
    closeModal("formModal");
    await caricaMateriali();
  } catch {
    showMsg("formMsgBox", "Impossibile contattare il server.", "error");
  }
}

async function confermaElimina() {
  const id = document.getElementById("deleteMaterialeId").value;
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/materiali/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Errore nell'eliminazione.");
      return;
    }
    closeModal("deleteModal");
    await caricaMateriali();
  } catch {
    alert("Impossibile contattare il server.");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  if (!ID_ATLETA) {
    window.location.href = "Dashboard.html";
    return;
  }
  const titolo = [NOME_ATLETA, COGNOME_ATLETA].filter(Boolean).join(" ");
  document.getElementById("titoloAtleta").textContent =
    titolo ? `Materiali: ${titolo}` : "Materiali atleta";
  caricaMateriali();
});
