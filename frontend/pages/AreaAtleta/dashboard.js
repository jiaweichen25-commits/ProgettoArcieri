const API_URL = "http://localhost:8000";

const MAT_LABELS = [
  ["riser", "Riser"], ["lunghezza_riser", "Lunghezza Riser"], ["flettenti", "Flettenti"],
  ["lunghezza_flettenti", "Lunghezza Flettenti"], ["potenza_nominale", "Potenza Nominale"],
  ["rest", "Rest"], ["mirino", "Mirino"], ["stabilizzazione", "Stabilizzazione"],
  ["aste", "Aste"], ["lunghezza_aste", "Lunghezza Aste"], ["punte", "Punte"],
  ["peso_punte", "Peso Punte"], ["cocche", "Cocche"], ["alette", "Alette"],
  ["lunghezza_alette", "Lunghezza Alette"], ["spine", "Spine"], ["corda", "Corda"],
  ["fili", "Fili"], ["patella", "Patella"], ["bottone", "Bottone"], ["molla", "Molla"],
  ["tiller_superiore", "Tiller Sup."], ["tiller_inferiore", "Tiller Inf."],
  ["brace", "Brace"], ["allungo", "Allungo"], ["potenza_reale", "Potenza Reale"],
  ["punto_incocco", "Punto Incocco"],
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

function parseToken() {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function requireAuth() {
  const payload = parseToken();
  if (!payload) {
    window.location.href = "../Autenticazione/Atleti.html";
    return false;
  }
  if (payload.ruolo !== "atleta") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser");
    window.location.href = "../Autenticazione/Atleti.html";
    return false;
  }
  const navUser = document.getElementById("navUser");
  if (navUser) {
    const saved = localStorage.getItem("currentUser");
    const user = saved ? JSON.parse(saved) : { email: payload.sub };
    navUser.textContent = user.email || payload.sub;
  }
  return true;
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("currentUser");
  window.location.href = "../Autenticazione/Atleti.html";
}

function escHtml(str) {
  if (str == null || str === "") return "—";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("it-IT");
}

function renderProfilo(p) {
  const grid = document.getElementById("profiloGrid");
  document.getElementById("titoloAtleta").textContent = `${p.nome} ${p.cognome}`;
  const fields = [
    ["Nome", p.nome], ["Cognome", p.cognome], ["Email", p.email],
    ["Cod. Fiscale", p.codice_fiscale], ["Data Nascita", formatDate(p.data_nascita)],
    ["Indirizzo", p.indirizzo], ["CAP", p.cap], ["Città", p.citta],
    ["Telefono", p.telefono], ["Cellulare", p.cellulare],
  ];
  grid.innerHTML = fields.map(([label, val]) => `
    <div class="profilo-item">
      <label>${label}</label>
      <span>${escHtml(val)}</span>
    </div>
  `).join("");
}

function renderMaterialeBox(m, targetId) {
  const el = document.getElementById(targetId);
  if (!m) {
    el.innerHTML = '<p class="empty-state">Nessun materiale in uso.</p>';
    return;
  }
  el.innerHTML = `
    <div class="materiale-grid">
      ${MAT_LABELS.map(([key, label]) =>
        `<span><strong>${label}:</strong> ${escHtml(m[key])}</span>`
      ).join("")}
    </div>
    <p style="margin-top:12px;font-size:0.78rem;color:#666">Data: ${formatDate(m.data)}</p>
  `;
}

function renderStoricoMateriali(lista) {
  const storico = document.getElementById("storicoMateriali");
  const empty = document.getElementById("emptyMateriali");
  const altri = lista.filter((m) => !m.materiale_corrente);

  if (!altri.length) {
    storico.innerHTML = "";
    empty.style.display = lista.length ? "none" : "block";
    if (lista.length) empty.style.display = "none";
    return;
  }
  empty.style.display = "none";
  storico.innerHTML = altri.map((m) => `
    <div class="storico-item">
      <strong>${formatDate(m.data)}</strong> —
      Riser: ${escHtml(m.riser)} · Flettenti: ${escHtml(m.flettenti)} · Corda: ${escHtml(m.corda)}
    </div>
  `).join("");
}

function renderAllenamenti(lista) {
  const box = document.getElementById("allenamentiList");
  const empty = document.getElementById("emptyAllenamenti");
  document.getElementById("cntAllenamenti").textContent = lista.length;

  if (!lista.length) {
    box.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  box.innerHTML = lista.map((a) => `
    <div class="storico-item">
      <strong>${formatDate(a.data_inizio)} – ${formatDate(a.data_fine)}</strong>
      ${escHtml(a.obiettivi)}
    </div>
  `).join("");
}

async function caricaDati() {
  try {
    const [profiloRes, matRes, allRes] = await Promise.all([
      fetch(`${API_URL}/me/profilo`, { headers: authHeaders() }),
      fetch(`${API_URL}/me/materiali`, { headers: authHeaders() }),
      fetch(`${API_URL}/me/allenamenti`, { headers: authHeaders() }),
    ]);

    if ([profiloRes, matRes, allRes].some((r) => r.status === 401)) {
      logout();
      return;
    }

    if (!profiloRes.ok) {
      document.getElementById("profiloGrid").innerHTML =
        '<p class="empty-state">Profilo non disponibile.</p>';
      return;
    }

    const profilo = await profiloRes.json();
    renderProfilo(profilo);

    const materiali = matRes.ok ? await matRes.json() : [];
    const corrente = materiali.find((m) => m.materiale_corrente) || materiali[0] || null;
    renderMaterialeBox(corrente, "materialeCorrente");
    renderStoricoMateriali(materiali);

    const allenamenti = allRes.ok ? await allRes.json() : [];
    renderAllenamenti(allenamenti);
  } catch {
    document.getElementById("profiloGrid").innerHTML =
      '<p class="empty-state">Impossibile contattare il server.</p>';
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  caricaDati();
});
