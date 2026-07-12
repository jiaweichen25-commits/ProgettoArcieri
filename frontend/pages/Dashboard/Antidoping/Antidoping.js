const API_URL = "http://localhost:8000";

const params = new URLSearchParams(window.location.search);
const ID_ATLETA = Number(params.get("atleta"));
const NOME_ATLETA = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";

let antidopingCache = [];

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
    window.location.href = "../../Autenticazione/Istruttore.html";
    return false;
  }
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
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

function tornaDashboard() {
  window.location.href = "../Dashboard.html";
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("currentUser");
  window.location.href = "../../Autenticazione/Istruttore.html";
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

async function caricaAntidoping() {
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/antidoping/`, {
      headers: authHeaders(),
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("pageMsgBox", err.detail || "Errore nel caricamento.", "error");
      return;
    }
    antidopingCache = await res.json();
    renderList();
  } catch {
    showMsg("pageMsgBox", "Impossibile contattare il server.", "error");
  }
}

function renderList() {
  const list = document.getElementById("antidopingList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  if (!antidopingCache.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  antidopingCache.forEach((a) => {
    const autorizzato = a.autorizzazione_fitarco;
    const card = document.createElement("div");
    card.className = "materiale-card" + (autorizzato ? " in-uso" : "");
    card.innerHTML = `
      <div>
        <div class="materiale-data">Anno: ${a.anno}</div>
        <span class="materiale-badge" style="background:${autorizzato ? "#276749" : "#c53030"}">
          ${autorizzato ? "Autorizzato" : "Non autorizzato"}
        </span>
      </div>
      <div class="materiale-summary">
        <span><strong>Anno:</strong> ${a.anno}</span>
        <span><strong>Autorizzazione Fitarco:</strong> ${autorizzato ? "Sì" : "No"}</span>
        <span><strong>Scadenza:</strong> ${formatDate(a.scadenza_autorizzazione)}</span>
      </div>
      <div class="materiale-actions">
        <button class="btn btn-sm btn-outline" type="button" data-edit="${a.IDantidoping}">Modifica</button>
        <button class="btn btn-sm btn-red" type="button" data-delete="${a.IDantidoping}">Elimina</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = antidopingCache.find((x) => x.IDantidoping === Number(btn.dataset.edit));
      if (a) openEditModal(a);
    });
  });

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = antidopingCache.find((x) => x.IDantidoping === Number(btn.dataset.delete));
      if (a) openDeleteModal(a);
    });
  });
}

function openAddModal() {
  clearMsg("formMsgBox");
  document.getElementById("editAntidopingId").value = "";
  document.getElementById("fAnno").value = new Date().getFullYear();
  document.getElementById("fAutorizzazione").checked = false;
  document.getElementById("fScadenza").value = "";
  document.getElementById("formModalPill").textContent = "Nuovo Record";
  document.getElementById("formModalTitle").textContent = "Aggiungi record";
  openModal("formModal");
}

function openEditModal(a) {
  clearMsg("formMsgBox");
  document.getElementById("editAntidopingId").value = a.IDantidoping;
  document.getElementById("fAnno").value = a.anno;
  document.getElementById("fAutorizzazione").checked = !!a.autorizzazione_fitarco;
  document.getElementById("fScadenza").value = toInputDate(a.scadenza_autorizzazione);
  document.getElementById("formModalPill").textContent = "Modifica";
  document.getElementById("formModalTitle").textContent = "Modifica record";
  openModal("formModal");
}

function openDeleteModal(a) {
  document.getElementById("deleteAntidopingId").value = a.IDantidoping;
  document.getElementById("deleteMsg").textContent =
    `Eliminare il record antidoping dell'anno ${a.anno}?`;
  openModal("deleteModal");
}

async function salvaAntidoping() {
  clearMsg("formMsgBox");
  const anno = document.getElementById("fAnno").value;

  if (!anno) {
    showMsg("formMsgBox", "L'anno è obbligatorio.", "error");
    return;
  }

  const oggi = new Date().toISOString().slice(0, 10);
  const scadenza = document.getElementById("fScadenza").value;

  if (scadenza && scadenza < oggi) {
    showMsg("formMsgBox", "La data di scadenza non può essere nel passato.", "error");
    return;
  }

  if (scadenza) {
    const annoScadenza = new Date(scadenza).getFullYear();
    if (annoScadenza < Number(anno)) {
      showMsg("formMsgBox", "La data di scadenza non può essere precedente all'anno del record.", "error");
      return;
    }
  }
  const dati = {
    anno: Number(anno),
    autorizzazione_fitarco: document.getElementById("fAutorizzazione").checked,
    scadenza_autorizzazione: scadenza || null,
  };

  const id = document.getElementById("editAntidopingId").value;
  const isEdit = !!id;
  const url = isEdit
    ? `${API_URL}/atleti/${ID_ATLETA}/antidoping/${id}`
    : `${API_URL}/atleti/${ID_ATLETA}/antidoping/`;

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
    await caricaAntidoping();
  } catch {
    showMsg("formMsgBox", "Impossibile contattare il server.", "error");
  }
}

async function confermaElimina() {
  const id = document.getElementById("deleteAntidopingId").value;
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/antidoping/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Errore nell'eliminazione.");
      return;
    }
    closeModal("deleteModal");
    await caricaAntidoping();
  } catch {
    alert("Impossibile contattare il server.");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  if (!ID_ATLETA) {
    window.location.href = "../Dashboard.html";
    return;
  }
  const titolo = [NOME_ATLETA, COGNOME_ATLETA].filter(Boolean).join(" ");
  document.getElementById("titoloAtleta").textContent = titolo || "—";
  document.getElementById("titoloAtleta2").textContent =
    titolo ? `Antidoping: ${titolo}` : "Antidoping";
  caricaAntidoping();
});