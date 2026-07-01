const API_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

const params = new URLSearchParams(window.location.search);
const ID_ALLENAMENTO = Number(params.get("allenamento"));
const NOME_ATLETA = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";
const DATA_INIZIO = params.get("inizio") || "";
const DATA_FINE = params.get("fine") || "";
const ID_ATLETA = params.get("atleta") || "";

let gareCache = [];
let tipiGaraCache = [];

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

function tornaAllenamenti() {
  const q = new URLSearchParams({
    atleta: ID_ATLETA,
    nome: NOME_ATLETA,
    cognome: COGNOME_ATLETA,
  });
  window.location.href = `Allenamenti.html?${q.toString()}`;
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("currentUser");
  window.location.href = "../Autenticazione/Istruttore.html";
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

function escHtml(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

async function caricaTipiGara() {
  try {
    const res = await fetch(`${API_URL}/allenamenti/tipi-gara/`, {
      headers: authHeaders(),
    });
    if (!res.ok) return;
    tipiGaraCache = await res.json();
    const select = document.getElementById("fTipoGara");
    select.innerHTML = '<option value="">— Seleziona tipo —</option>';
    tipiGaraCache.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.IDtipogara;
      opt.textContent = t.descrizione || `Tipo ${t.IDtipogara}`;
      select.appendChild(opt);
    });
  } catch {
    console.error("Errore caricamento tipi gara");
  }
}

async function caricaGare() {
  try {
    const res = await fetch(`${API_URL}/allenamenti/${ID_ALLENAMENTO}/gare/`, {
      headers: authHeaders(),
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("pageMsgBox", err.detail || "Errore nel caricamento.", "error");
      return;
    }
    gareCache = await res.json();
    renderList();
  } catch {
    showMsg("pageMsgBox", "Impossibile contattare il server.", "error");
  }
}

function renderList() {
  const list = document.getElementById("gareList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  const gareVisibili = gareCache.filter((g) => !g.escludi_visualizzazione);

  if (!gareCache.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  gareCache.forEach((g) => {
    const card = document.createElement("div");
    card.className = "materiale-card" + (g.escludi_visualizzazione ? "" : " in-uso");
    card.innerHTML = `
      <div>
        <div class="materiale-data">${formatDate(g.data)}</div>
        <span class="materiale-badge" style="background:${g.escludi_visualizzazione ? "#555" : "#276749"}">
          ${g.escludi_visualizzazione ? "Esclusa" : "Visibile"}
        </span>
      </div>
      <div class="materiale-summary">
        <span><strong>Tipo:</strong> ${escHtml(g.tipo_gara) || "—"}</span>
        <span><strong>Data:</strong> ${formatDate(g.data)}</span>
        <span><strong>Luogo:</strong> ${escHtml(g.luogo) || "—"}</span>
        <span><strong>Distanza:</strong> ${escHtml(g.distanza) || "—"}</span>
        ${g.note ? `<span><strong>Note:</strong> ${escHtml(g.note)}</span>` : ""}
      </div>
      <div class="materiale-actions">
        <button class="btn btn-sm btn-outline" type="button" data-edit="${g.IDpianogara}">Modifica</button>
        <button class="btn btn-sm btn-red" type="button" data-delete="${g.IDpianogara}">Elimina</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const g = gareCache.find((x) => x.IDpianogara === Number(btn.dataset.edit));
      if (g) openEditModal(g);
    });
  });

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const g = gareCache.find((x) => x.IDpianogara === Number(btn.dataset.delete));
      if (g) openDeleteModal(g);
    });
  });
}

function openAddModal() {
  clearMsg("formMsgBox");
  document.getElementById("editGaraId").value = "";
  document.getElementById("fTipoGara").value = "";
  document.getElementById("fData").value = "";
  document.getElementById("fLuogo").value = "";
  document.getElementById("fDistanza").value = "";
  document.getElementById("fNote").value = "";
  document.getElementById("fEscludi").checked = false;
  document.getElementById("formModalPill").textContent = "Nuova Gara";
  document.getElementById("formModalTitle").textContent = "Aggiungi gara";
  openModal("formModal");
}

function openEditModal(g) {
  clearMsg("formMsgBox");
  document.getElementById("editGaraId").value = g.IDpianogara;
  document.getElementById("fTipoGara").value = g.id_tipogara || "";
  document.getElementById("fData").value = toInputDate(g.data);
  document.getElementById("fLuogo").value = g.luogo || "";
  document.getElementById("fDistanza").value = g.distanza || "";
  document.getElementById("fNote").value = g.note || "";
  document.getElementById("fEscludi").checked = !!g.escludi_visualizzazione;
  document.getElementById("formModalPill").textContent = "Modifica";
  document.getElementById("formModalTitle").textContent = "Modifica gara";
  openModal("formModal");
}

function openDeleteModal(g) {
  document.getElementById("deleteGaraId").value = g.IDpianogara;
  document.getElementById("deleteMsg").textContent =
    `Eliminare la gara del ${formatDate(g.data)} a ${g.luogo || "—"}?`;
  openModal("deleteModal");
}

async function salvaGara() {
  clearMsg("formMsgBox");

  const dati = {
    id_tipogara: document.getElementById("fTipoGara").value
      ? Number(document.getElementById("fTipoGara").value)
      : null,
    data: document.getElementById("fData").value || null,
    luogo: document.getElementById("fLuogo").value.trim() || null,
    distanza: document.getElementById("fDistanza").value.trim() || null,
    note: document.getElementById("fNote").value.trim() || null,
    escludi_visualizzazione: document.getElementById("fEscludi").checked,
  };

  const id = document.getElementById("editGaraId").value;
  const isEdit = !!id;
  const url = isEdit
    ? `${API_URL}/allenamenti/${ID_ALLENAMENTO}/gare/${id}`
    : `${API_URL}/allenamenti/${ID_ALLENAMENTO}/gare/`;

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
    await caricaGare();
  } catch {
    showMsg("formMsgBox", "Impossibile contattare il server.", "error");
  }
}

async function confermaElimina() {
  const id = document.getElementById("deleteGaraId").value;
  try {
    const res = await fetch(`${API_URL}/allenamenti/${ID_ALLENAMENTO}/gare/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Errore nell'eliminazione.");
      return;
    }
    closeModal("deleteModal");
    await caricaGare();
  } catch {
    alert("Impossibile contattare il server.");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  if (!ID_ALLENAMENTO) {
    window.location.href = "Dashboard.html";
    return;
  }

  const titolo = [NOME_ATLETA, COGNOME_ATLETA].filter(Boolean).join(" ");
  document.getElementById("titoloAtleta").textContent = titolo || "—";
  document.getElementById("titoloAtleta2").textContent =
    titolo ? `Piano Gare: ${titolo}` : "Piano Gare";
  document.getElementById("periodoAllenamento").textContent =
    DATA_INIZIO && DATA_FINE
      ? `Allenamento dal ${formatDate(DATA_INIZIO)} al ${formatDate(DATA_FINE)}`
      : "";

  caricaTipiGara();
  caricaGare();
});