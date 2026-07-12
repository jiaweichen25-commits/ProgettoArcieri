const API_URL = "http://localhost:8000";

const params = new URLSearchParams(window.location.search);
const ID_ATLETA = Number(params.get("atleta"));
const NOME_ATLETA = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";

let visiteCache = [];

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

async function caricaVisite() {
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/visite/`, {
      headers: authHeaders(),
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("pageMsgBox", err.detail || "Errore nel caricamento.", "error");
      return;
    }
    visiteCache = await res.json();
    renderList();
  } catch {
    showMsg("pageMsgBox", "Impossibile contattare il server.", "error");
  }
}

function renderList() {
  const list = document.getElementById("visitaList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  if (!visiteCache.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  visiteCache.forEach((v) => {
    const scaduta = new Date(v.data_scadenza) < new Date();
    const card = document.createElement("div");
    card.className = "materiale-card" + (scaduta ? "" : " in-uso");
    card.innerHTML = `
      <div>
        <div class="materiale-data">Visita: ${formatDate(v.data_visita)}</div>
        <span class="materiale-badge" style="background:${scaduta ? "#c53030" : "#276749"}">
          ${scaduta ? "Scaduta" : "Valida"}
        </span>
      </div>
      <div class="materiale-summary">
        <span><strong>Data visita:</strong> ${formatDate(v.data_visita)}</span>
        <span><strong>Scadenza:</strong> ${formatDate(v.data_scadenza)}</span>
      </div>
      <div class="materiale-actions">
        <button class="btn btn-sm btn-outline" type="button" data-edit="${v.IDvisita}">Modifica</button>
        <button class="btn btn-sm btn-red" type="button" data-delete="${v.IDvisita}">Elimina</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = visiteCache.find((x) => x.IDvisita === Number(btn.dataset.edit));
      if (v) openEditModal(v);
    });
  });

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = visiteCache.find((x) => x.IDvisita === Number(btn.dataset.delete));
      if (v) openDeleteModal(v);
    });
  });
}

function openAddModal() {
  clearMsg("formMsgBox");
  document.getElementById("editVisitaId").value = "";
  document.getElementById("fDataVisita").value = "";
  document.getElementById("fDataScadenza").value = "";
  document.getElementById("formModalPill").textContent = "Nuova Visita";
  document.getElementById("formModalTitle").textContent = "Aggiungi visita";
  openModal("formModal");
}

function openEditModal(v) {
  clearMsg("formMsgBox");
  document.getElementById("editVisitaId").value = v.IDvisita;
  document.getElementById("fDataVisita").value = toInputDate(v.data_visita);
  document.getElementById("fDataScadenza").value = toInputDate(v.data_scadenza);
  document.getElementById("formModalPill").textContent = "Modifica";
  document.getElementById("formModalTitle").textContent = "Modifica visita";
  openModal("formModal");
}

function openDeleteModal(v) {
  document.getElementById("deleteVisitaId").value = v.IDvisita;
  document.getElementById("deleteMsg").textContent =
    `Eliminare la visita del ${formatDate(v.data_visita)}?`;
  openModal("deleteModal");
}

async function salvaVisita() {
  clearMsg("formMsgBox");
  const data_visita = document.getElementById("fDataVisita").value;
  const data_scadenza = document.getElementById("fDataScadenza").value;

  if (!data_visita || !data_scadenza) {
    showMsg("formMsgBox", "Entrambe le date sono obbligatorie.", "error");
    return;
  }

  const oggi = new Date().toISOString().slice(0, 10);

  if (data_visita < oggi) {
    showMsg("formMsgBox", "La data della visita non può essere nel passato.", "error");
    return;
  }

  if (data_scadenza <= data_visita) {
    showMsg("formMsgBox", "La data di scadenza deve essere successiva alla data della visita.", "error");
    return;
  }

  const id = document.getElementById("editVisitaId").value;
  const isEdit = !!id;
  const url = isEdit
    ? `${API_URL}/atleti/${ID_ATLETA}/visite/${id}`
    : `${API_URL}/atleti/${ID_ATLETA}/visite/`;

  try {
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify({ data_visita, data_scadenza }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("formMsgBox", err.detail || "Errore nel salvataggio.", "error");
      return;
    }
    closeModal("formModal");
    await caricaVisite();
  } catch {
    showMsg("formMsgBox", "Impossibile contattare il server.", "error");
  }
}

async function confermaElimina() {
  const id = document.getElementById("deleteVisitaId").value;
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/visite/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Errore nell'eliminazione.");
      return;
    }
    closeModal("deleteModal");
    await caricaVisite();
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
    titolo ? `Visite Mediche: ${titolo}` : "Visite Mediche";
  caricaVisite();
});