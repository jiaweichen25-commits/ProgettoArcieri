const API_URL = "http://localhost:8000";

let atletiCache = [];
let selectedAtleta = null;

function getToken() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("currentUser");
      window.location.href = "../Autenticazione/Istruttore.html";
      return false;
    }
    const navUser = document.getElementById("navUser");
    if (navUser) {
      const saved = localStorage.getItem("currentUser");
      const user = saved ? JSON.parse(saved) : { email: payload.sub };
      navUser.textContent = user.email || payload.sub;
    }
    return true;
  } catch {
    localStorage.removeItem("access_token");
    window.location.href = "../Autenticazione/Istruttore.html";
    return false;
  }
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("currentUser");
  window.location.href = "../Autenticazione/Istruttore.html";
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

async function caricaAtleti() {
  try {
    const response = await fetch(`${API_URL}/atleti/`, {
      headers: authHeaders(),
    });

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Errore GET atleti:", err.detail || response.statusText);
      return;
    }

    atletiCache = await response.json();
    renderTable(atletiCache);
  } catch (error) {
    console.error("Errore GET:", error);
  }
}

function renderTable(lista) {
  const tbody = document.getElementById("atletiBody");
  const emptyState = document.getElementById("emptyState");
  const search = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();

  let rows = lista;
  if (search) {
    rows = lista.filter((a) => {
      const hay = [a.nome, a.cognome, a.email, a.codice_fiscale, a.citta]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(search);
    });
  }

  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    emptyState.style.display = "block";
    document.getElementById("cntAtleti").innerText = lista.length;
    return;
  }

  emptyState.style.display = "none";

  rows.forEach((atleta) => {
    const id = atleta.IDatleta;

    // Riga 1: dati dell'atleta
    const trData = document.createElement("tr");
    trData.classList.add("atleta-data-row");
    trData.innerHTML = `
      <td>${id}</td>
      <td><strong>${escHtml(atleta.nome)}</strong></td>
      <td><strong>${escHtml(atleta.cognome)}</strong></td>
      <td>${escHtml(atleta.indirizzo) || "—"}</td>
      <td>${escHtml(atleta.cap) || "—"}</td>
      <td>${escHtml(atleta.citta) || "—"}</td>
      <td>${escHtml(atleta.codice_fiscale) || "—"}</td>
      <td>${escHtml(atleta.telefono) || "—"}</td>
      <td>${escHtml(atleta.cellulare) || "—"}</td>
      <td>${atleta.email ? `<a href="mailto:${escHtml(atleta.email)}">${escHtml(atleta.email)}</a>` : "—"}</td>
      <td>${formatDate(atleta.data_nascita)}</td>
    `;
    tbody.appendChild(trData);

    // Riga 2: bottoni azione sotto i dati
    const trActions = document.createElement("tr");
    trActions.classList.add("atleta-actions-row");
    trActions.innerHTML = `
      <td colspan="11" class="actions-cell">
        <div class="actions-bar">
          <button class="btn btn-sm btn-outline" type="button" data-materiali="${id}">Materiali</button>
          <button class="btn btn-sm btn-outline" type="button" data-visite="${id}">Visite</button>
          <button class="btn btn-sm btn-outline" type="button" data-antidoping="${id}">Antidoping</button>
          <button class="btn btn-sm btn-outline" type="button" data-allenamenti="${id}">Allenamenti</button>
          <button class="btn btn-sm btn-outline" type="button" data-segnapunti="${id}">Segnapunti</button>
          <button class="btn btn-sm btn-outline" type="button" data-ai="${id}">Assistente IA</button>
          <button class="btn btn-sm btn-outline" type="button" data-edit="${id}">Modifica</button>
          <button class="btn btn-sm btn-red" type="button" data-delete="${id}">Elimina</button>
        </div>
      </td>
    `;
    tbody.appendChild(trActions);
  });

  tbody.querySelectorAll("[data-materiali]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = atletiCache.find((x) => x.IDatleta === Number(btn.dataset.materiali));
      if (a) {
        const q = new URLSearchParams({
          atleta: a.IDatleta,
          nome: a.nome || "",
          cognome: a.cognome || "",
        });
        window.location.href = `Materiali.html?${q.toString()}`;
      }
    });
  });

  tbody.querySelectorAll("[data-visite]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = atletiCache.find((x) => x.IDatleta === Number(btn.dataset.visite));
      if (a) {
        const q = new URLSearchParams({ atleta: a.IDatleta, nome: a.nome || "", cognome: a.cognome || "" });
        window.location.href = `Visitemed.html?${q.toString()}`;
      }
    });
  });

  tbody.querySelectorAll("[data-antidoping]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = atletiCache.find((x) => x.IDatleta === Number(btn.dataset.antidoping));
      if (a) {
        const q = new URLSearchParams({ atleta: a.IDatleta, nome: a.nome || "", cognome: a.cognome || "" });
        window.location.href = `Antidoping.html?${q.toString()}`;
      }
    });
  });

  tbody.querySelectorAll("[data-allenamenti]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = atletiCache.find((x) => x.IDatleta === Number(btn.dataset.allenamenti));
      if (a) {
        const q = new URLSearchParams({ atleta: a.IDatleta, nome: a.nome || "", cognome: a.cognome || "" });
        window.location.href = `Allenamenti.html?${q.toString()}`;
      }
    });
  });

  tbody.querySelectorAll("[data-segnapunti]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = atletiCache.find((x) => x.IDatleta === Number(btn.dataset.segnapunti));
      if (a) {
        const q = new URLSearchParams({ atleta: a.IDatleta, nome: a.nome || "", cognome: a.cognome || "" });
        window.location.href = `Segnapunti.html?${q.toString()}`;
      }
    });
  });

  tbody.querySelectorAll("[data-ai]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = atletiCache.find((x) => x.IDatleta === Number(btn.dataset.ai));
      if (a) selezionaAtleta(a);
    });
  });

  tbody.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = atletiCache.find((x) => x.IDatleta === Number(btn.dataset.edit));
      if (a) openEditModal(a);
    });
  });

  tbody.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = atletiCache.find((x) => x.IDatleta === Number(btn.dataset.delete));
      if (a) openDeleteModal(a);
    });
  });

  document.getElementById("cntAtleti").innerText = lista.length;
}

function filterTable() {
  renderTable(atletiCache);
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  if (id === "addModal") clearMsg("addMsgBox");
  if (id === "editModal") clearMsg("editMsgBox");
}

function openAddModal() {
  clearMsg("addMsgBox");
  ["addNome", "addCognome", "addCf", "addEmail", "addIndirizzo", "addCap", "addCitta", "addTelefono", "addCellulare", "addDataNascita"].forEach(
    (fid) => {
      const el = document.getElementById(fid);
      if (el) el.value = "";
    }
  );
  openModal("addModal");
}

function openEditModal(atleta) {
  clearMsg("editMsgBox");
  document.getElementById("editId").value = atleta.IDatleta;
  document.getElementById("editNome").value = atleta.nome || "";
  document.getElementById("editCognome").value = atleta.cognome || "";
  document.getElementById("editCf").value = atleta.codice_fiscale || "";
  document.getElementById("editEmail").value = atleta.email || "";
  document.getElementById("editIndirizzo").value = atleta.indirizzo || "";
  document.getElementById("editCap").value = atleta.cap || "";
  document.getElementById("editCitta").value = atleta.citta || "";
  document.getElementById("editTelefono").value = atleta.telefono || "";
  document.getElementById("editCellulare").value = atleta.cellulare || "";
  document.getElementById("editDataNascita").value = toInputDate(atleta.data_nascita);
  openModal("editModal");
}

function openDeleteModal(atleta) {
  document.getElementById("deleteId").value = atleta.IDatleta;
  document.getElementById("deleteMsg").textContent =
    `Sei sicuro di voler eliminare ${atleta.nome} ${atleta.cognome}? L'operazione non è reversibile.`;
  openModal("deleteModal");
}

function readAddForm() {
  const data_nascita = document.getElementById("addDataNascita").value || null;
  return {
    nome: document.getElementById("addNome").value.trim(),
    cognome: document.getElementById("addCognome").value.trim(),
    codice_fiscale: document.getElementById("addCf").value.trim().toUpperCase(),
    email: document.getElementById("addEmail").value.trim(),
    indirizzo: document.getElementById("addIndirizzo").value.trim() || null,
    cap: document.getElementById("addCap").value.trim() || null,
    citta: document.getElementById("addCitta").value.trim() || null,
    telefono: document.getElementById("addTelefono").value.trim() || null,
    cellulare: document.getElementById("addCellulare").value.trim() || null,
    data_nascita,
  };
}

function readEditForm() {
  const data_nascita = document.getElementById("editDataNascita").value || null;
  return {
    nome: document.getElementById("editNome").value.trim(),
    cognome: document.getElementById("editCognome").value.trim(),
    codice_fiscale: document.getElementById("editCf").value.trim().toUpperCase(),
    email: document.getElementById("editEmail").value.trim() || null,
    indirizzo: document.getElementById("editIndirizzo").value.trim() || null,
    cap: document.getElementById("editCap").value.trim() || null,
    citta: document.getElementById("editCitta").value.trim() || null,
    telefono: document.getElementById("editTelefono").value.trim() || null,
    cellulare: document.getElementById("editCellulare").value.trim() || null,
    data_nascita,
  };
}

function validateAtleta(dati, requireEmail) {
  if (!dati.nome || !dati.cognome || !dati.codice_fiscale) {
    return "Nome, cognome e codice fiscale sono obbligatori.";
  }
  if (requireEmail && !dati.email) {
    return "L'email è obbligatoria per un nuovo atleta.";
  }
  return null;
}

async function salvaAtleta() {
  clearMsg("addMsgBox");
  const dati = readAddForm();
  const err = validateAtleta(dati, true);
  if (err) {
    showMsg("addMsgBox", err, "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/atleti/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(dati),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showMsg("addMsgBox", body.detail || "Errore durante il salvataggio.", "error");
      return;
    }

    closeModal("addModal");
    await caricaAtleti();
  } catch {
    showMsg("addMsgBox", "Impossibile contattare il server.", "error");
  }
}

async function aggiornaAtleta() {
  clearMsg("editMsgBox");
  const id = document.getElementById("editId").value;
  const dati = readEditForm();
  const err = validateAtleta(dati, false);
  if (err) {
    showMsg("editMsgBox", err, "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/atleti/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(dati),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showMsg("editMsgBox", body.detail || "Errore durante l'aggiornamento.", "error");
      return;
    }

    closeModal("editModal");
    await caricaAtleti();
  } catch {
    showMsg("editMsgBox", "Impossibile contattare il server.", "error");
  }
}

async function confermaElimina() {
  const id = document.getElementById("deleteId").value;

  try {
    const res = await fetch(`${API_URL}/atleti/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok && res.status !== 204) {
      const body = await res.json().catch(() => ({}));
      alert(body.detail || "Errore durante l'eliminazione.");
      return;
    }

    closeModal("deleteModal");
    await caricaAtleti();
  } catch {
    alert("Impossibile contattare il server.");
  }
}

// ══════════════════════════════════════════
// Chiedi all'Agente AI
// ══════════════════════════════════════════

function toggleSectionAi() {
  const panel = document.getElementById("sectionAi");
  const backdrop = document.getElementById("aiBackdrop");
  if (!panel) return;
  panel.classList.toggle("open");
  if (backdrop) backdrop.classList.toggle("open");
}

function selezionaAtleta(atleta) {
  selectedAtleta = atleta;

  const pill = document.getElementById("aiSelectedPill");
  if (pill) {
    pill.textContent = `${atleta.nome} ${atleta.cognome}`;
    pill.classList.add("active");
  }

  const textarea = document.getElementById("aiDomanda");
  if (textarea) {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
  }

  document.getElementById("sectionAi")?.classList.add("open");
  document.getElementById("aiBackdrop")?.classList.add("open");
}

function deselezionaAtleta() {
  selectedAtleta = null;

  const pill = document.getElementById("aiSelectedPill");
  if (pill) {
    pill.textContent = "Nessun atleta selezionato";
    pill.classList.remove("active");
  }

  const textarea = document.getElementById("aiDomanda");
  if (textarea) textarea.value = "";

  const history = document.getElementById("aiHistory");
  if (history) history.innerHTML = "";

  document.getElementById("sectionAi")?.classList.remove("open");
  document.getElementById("aiBackdrop")?.classList.remove("open");
}

async function inviaDomandaAgente() {
  const textarea = document.getElementById("aiDomanda");
  const domanda = textarea ? textarea.value.trim() : "";
  const historyBox = document.getElementById("aiHistory");
  const loadingBox = document.getElementById("aiLoading");

  if (!domanda) return;

  // Aggiungi la bubble dell'utente
  if (historyBox) {
    const userBubble = document.createElement("div");
    userBubble.className = "ai-bubble user-bubble";
    userBubble.textContent = domanda;
    historyBox.appendChild(userBubble);
    historyBox.scrollTop = historyBox.scrollHeight;
  }

  // Pulisci il campo input
  if (textarea) textarea.value = "";

  if (loadingBox) loadingBox.classList.add("show");

  try {
    const res = await fetch(`${API_URL}/ai_assistant/query`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        domanda,
        id_atleta: selectedAtleta ? selectedAtleta.IDatleta : null,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (historyBox) {
        const errorBubble = document.createElement("div");
        errorBubble.className = "ai-bubble ai-bubble-response";
        errorBubble.style.borderColor = "#c0392b";
        errorBubble.style.color = "#e74c3c";
        errorBubble.textContent = body.detail || "Errore durante la richiesta all'agente.";
        historyBox.appendChild(errorBubble);
        historyBox.scrollTop = historyBox.scrollHeight;
      }
      return;
    }

    const data = await res.json();
    if (historyBox) {
      const aiBubble = document.createElement("div");
      aiBubble.className = "ai-bubble ai-bubble-response";
      aiBubble.textContent = data.risposta || "Nessuna risposta ricevuta.";
      
      if (data.provider && data.model) {
        const debugInfo = document.createElement("div");
        debugInfo.className = "ai-debug-info";
        debugInfo.textContent = `⚡ Generato da: ${data.model} (tramite ${data.provider}) - Task: ${data.task || "generale"}`;
        aiBubble.appendChild(debugInfo);
      }
      
      historyBox.appendChild(aiBubble);
      historyBox.scrollTop = historyBox.scrollHeight;
    }
  } catch {
    if (historyBox) {
      const errorBubble = document.createElement("div");
      errorBubble.className = "ai-bubble ai-bubble-response";
      errorBubble.style.borderColor = "#c0392b";
      errorBubble.style.color = "#e74c3c";
      errorBubble.textContent = "Impossibile contattare il server.";
      historyBox.appendChild(errorBubble);
      historyBox.scrollTop = historyBox.scrollHeight;
    }
  } finally {
    if (loadingBox) loadingBox.classList.remove("show");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  caricaAtleti();
});