const API_URL = "http://localhost:8000";

const params = new URLSearchParams(window.location.search);
const ID_ATLETA = Number(params.get("atleta"));
const NOME_ATLETA = params.get("nome") || "";
const COGNOME_ATLETA = params.get("cognome") || "";

let allenamentoCache = [];

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

function tornaDashboard() {
  window.location.href = "Dashboard.html";
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

function escHtml(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  clearMsg("formMsgBox");
}

async function caricaAllenamenti() {
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/allenamenti/`, {
      headers: authHeaders(),
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("pageMsgBox", err.detail || "Errore nel caricamento.", "error");
      return;
    }
    allenamentoCache = await res.json();
    renderList();
  } catch {
    showMsg("pageMsgBox", "Impossibile contattare il server.", "error");
  }
}

function renderList() {
  const list = document.getElementById("allenamentoList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  if (!allenamentoCache.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  allenamentoCache.forEach((a) => {
    const oggi = new Date();
    const fine = new Date(a.data_fine);
    const inCorso = fine >= oggi;
    const card = document.createElement("div");
    card.className = "materiale-card" + (inCorso ? " in-uso" : "");
    card.innerHTML = `
      <div>
        <div class="materiale-data">${formatDate(a.data_inizio)} → ${formatDate(a.data_fine)}</div>
        <span class="materiale-badge" style="background:${inCorso ? "#276749" : "#c53030"}">
          ${inCorso ? "In corso" : "Concluso"}
        </span>
      </div>
      <div class="materiale-summary">
        <span><strong>Inizio:</strong> ${formatDate(a.data_inizio)}</span>
        <span><strong>Fine:</strong> ${formatDate(a.data_fine)}</span>
        <span><strong>Obiettivi:</strong> ${escHtml(a.obiettivi) || "—"}</span>
      </div>
      <div class="materiale-actions">
        <button class="btn btn-sm btn-outline" type="button" data-gare="${a.IDallenamento}">Piano Gare</button>
        <button class="btn btn-sm btn-outline" type="button" data-edit="${a.IDallenamento}">Modifica</button>
        <button class="btn btn-sm btn-red" type="button" data-delete="${a.IDallenamento}">Elimina</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = allenamentoCache.find((x) => x.IDallenamento === Number(btn.dataset.edit));
      if (a) openEditModal(a);
    });
  });

  list.querySelectorAll("[data-gare]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const a = allenamentoCache.find((x) => x.IDallenamento === Number(btn.dataset.gare));
        if (a) {
          const q = new URLSearchParams({
            allenamento: a.IDallenamento,
            atleta: ID_ATLETA,
            nome: NOME_ATLETA,
            cognome: COGNOME_ATLETA,
            inizio: a.data_inizio,
            fine: a.data_fine,
          });
          window.location.href = `PianoGare.html?${q.toString()}`;
        }
      });
    });

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = allenamentoCache.find((x) => x.IDallenamento === Number(btn.dataset.delete));
      if (a) openDeleteModal(a);
    });
  });
}

function openAddModal() {
  clearMsg("formMsgBox");
  document.getElementById("editAllenamentoId").value = "";
  document.getElementById("fDataInizio").value = "";
  document.getElementById("fDataFine").value = "";
  document.getElementById("fObiettivi").value = "";
  document.getElementById("formModalPill").textContent = "Nuovo Allenamento";
  document.getElementById("formModalTitle").textContent = "Aggiungi allenamento";
  openModal("formModal");
}

function openEditModal(a) {
  clearMsg("formMsgBox");
  document.getElementById("editAllenamentoId").value = a.IDallenamento;
  document.getElementById("fDataInizio").value = toInputDate(a.data_inizio);
  document.getElementById("fDataFine").value = toInputDate(a.data_fine);
  document.getElementById("fObiettivi").value = a.obiettivi || "";
  document.getElementById("formModalPill").textContent = "Modifica";
  document.getElementById("formModalTitle").textContent = "Modifica allenamento";
  openModal("formModal");
}

function openDeleteModal(a) {
  document.getElementById("deleteAllenamentoId").value = a.IDallenamento;
  document.getElementById("deleteMsg").textContent =
    `Eliminare l'allenamento dal ${formatDate(a.data_inizio)} al ${formatDate(a.data_fine)}?`;
  openModal("deleteModal");
}

async function salvaAllenamento() {
  clearMsg("formMsgBox");
  const data_inizio = document.getElementById("fDataInizio").value;
  const data_fine = document.getElementById("fDataFine").value;
  const obiettivi = document.getElementById("fObiettivi").value.trim() || null;

  if (!data_inizio || !data_fine) {
    showMsg("formMsgBox", "Le date di inizio e fine sono obbligatorie.", "error");
    return;
  }

  if (data_fine <= data_inizio) {
    showMsg("formMsgBox", "La data di fine deve essere successiva alla data di inizio.", "error");
    return;
  }

  const id = document.getElementById("editAllenamentoId").value;
  const isEdit = !!id;
  const url = isEdit
    ? `${API_URL}/atleti/${ID_ATLETA}/allenamenti/${id}`
    : `${API_URL}/atleti/${ID_ATLETA}/allenamenti/`;

  try {
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify({ data_inizio, data_fine, obiettivi }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showMsg("formMsgBox", err.detail || "Errore nel salvataggio.", "error");
      return;
    }
    closeModal("formModal");
    await caricaAllenamenti();
  } catch {
    showMsg("formMsgBox", "Impossibile contattare il server.", "error");
  }
}

async function confermaElimina() {
  const id = document.getElementById("deleteAllenamentoId").value;
  try {
    const res = await fetch(`${API_URL}/atleti/${ID_ATLETA}/allenamenti/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Errore nell'eliminazione.");
      return;
    }
    closeModal("deleteModal");
    await caricaAllenamenti();
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
  document.getElementById("titoloAtleta").textContent = titolo || "—";
  document.getElementById("titoloAtleta2").textContent =
    titolo ? `Allenamenti: ${titolo}` : "Allenamenti";
  caricaAllenamenti();
});