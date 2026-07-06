const API_URL = "http://localhost:8000";

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
    window.location.href = "/pages/Autenticazione/Atleti.html";
    return false;
  }
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.ruolo !== "atleta") {
      localStorage.clear();
      window.location.href = "../Autenticazione/Atleti.html";
      return false;
    }
    return true;
  } catch {
    window.location.href = "../Autenticazione/Atleti.html";
    return false;
  }
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("currentUser");
  window.location.href = "../Autenticazione/Atleti.html";
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("it-IT");
}

function escHtml(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function val(v) {
  return v ? escHtml(v) : "—";
}

// ══ PROFILO ══
async function caricaProfilo() {
  try {
    const res = await fetch(`${API_URL}/me/profilo`, { headers: authHeaders() });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) return;
    const p = await res.json();

    document.getElementById("nomeAtleta").textContent = `${p.nome} ${p.cognome}`;
    document.getElementById("navUser").textContent = `${p.nome} ${p.cognome}`;
    document.getElementById("pNome").textContent = val(p.nome);
    document.getElementById("pCognome").textContent = val(p.cognome);
    document.getElementById("pCf").textContent = val(p.codice_fiscale);
    document.getElementById("pDataNascita").textContent = formatDate(p.data_nascita);
    document.getElementById("pIndirizzo").textContent = val(p.indirizzo);
    document.getElementById("pCap").textContent = val(p.cap);
    document.getElementById("pCitta").textContent = val(p.citta);
    document.getElementById("pTelefono").textContent = val(p.telefono);
    document.getElementById("pCellulare").textContent = val(p.cellulare);
    document.getElementById("pEmail").textContent = val(p.email);
  } catch {
    console.error("Errore caricamento profilo");
  }
}

// ══ MATERIALI ══
async function caricaMateriali() {
  try {
    const res = await fetch(`${API_URL}/me/materiali`, { headers: authHeaders() });
    if (!res.ok) return;
    const lista = await res.json();

    const corrente = lista.find((m) => m.materiale_corrente);
    const storico = lista.filter((m) => !m.materiale_corrente);

    // Materiale corrente
    const boxCorrente = document.getElementById("materialeCorrente");
    const emptyCorrente = document.getElementById("materialeCorrenteEmpty");
    if (corrente) {
      emptyCorrente.style.display = "none";
      boxCorrente.innerHTML = `
        <div class="info-card in-uso">
          <div class="info-card-header">
            <span class="materiale-badge">In uso</span>
            <span class="info-date">${formatDate(corrente.data)}</span>
          </div>
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Riser</span><span class="info-value">${val(corrente.riser)}</span></div>
            <div class="info-item"><span class="info-label">Flettenti</span><span class="info-value">${val(corrente.flettenti)}</span></div>
            <div class="info-item"><span class="info-label">Potenza Nominale</span><span class="info-value">${val(corrente.potenza_nominale)}</span></div>
            <div class="info-item"><span class="info-label">Potenza Reale</span><span class="info-value">${val(corrente.potenza_reale)}</span></div>
            <div class="info-item"><span class="info-label">Mirino</span><span class="info-value">${val(corrente.mirino)}</span></div>
            <div class="info-item"><span class="info-label">Corda</span><span class="info-value">${val(corrente.corda)}</span></div>
            <div class="info-item"><span class="info-label">Punte</span><span class="info-value">${val(corrente.punte)}</span></div>
            <div class="info-item"><span class="info-label">Allungo</span><span class="info-value">${val(corrente.allungo)}</span></div>
          </div>
        </div>
      `;
    }

    // Storico
    const boxStorico = document.getElementById("storicoMateriali");
    const emptyStorico = document.getElementById("storicoEmpty");
    if (!storico.length) {
      emptyStorico.style.display = "block";
      return;
    }
    emptyStorico.style.display = "none";
    boxStorico.innerHTML = storico.map((m) => `
      <div class="info-card">
        <div class="info-card-header">
          <span class="info-date">${formatDate(m.data)}</span>
        </div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Riser</span><span class="info-value">${val(m.riser)}</span></div>
          <div class="info-item"><span class="info-label">Flettenti</span><span class="info-value">${val(m.flettenti)}</span></div>
          <div class="info-item"><span class="info-label">Potenza Reale</span><span class="info-value">${val(m.potenza_reale)}</span></div>
          <div class="info-item"><span class="info-label">Mirino</span><span class="info-value">${val(m.mirino)}</span></div>
        </div>
      </div>
    `).join("");
  } catch {
    console.error("Errore caricamento materiali");
  }
}

// ══ ALLENAMENTI ══
async function caricaAllenamenti() {
  try {
    const res = await fetch(`${API_URL}/me/allenamenti`, { headers: authHeaders() });
    if (!res.ok) return;
    const lista = await res.json();

    const box = document.getElementById("allenamentoList");
    const empty = document.getElementById("allenamentoEmpty");

    if (!lista.length) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    const oggi = new Date();
    box.innerHTML = lista.map((a) => {
      const inCorso = new Date(a.data_fine) >= oggi;
      return `
        <div class="info-card allenamento-card${inCorso ? " in-uso" : ""}">
          <div class="info-card-header">
            <span class="materiale-badge" style="background:${inCorso ? "#276749" : "#c53030"}">
              ${inCorso ? "In corso" : "Concluso"}
            </span>
            <span class="info-date">${formatDate(a.data_inizio)} → ${formatDate(a.data_fine)}</span>
          </div>
          ${a.obiettivi ? `<p class="info-obiettivi">${escHtml(a.obiettivi)}</p>` : ""}
          <button class="btn-dettaglio" onclick="toggleDettaglio(${a.IDallenamento}, this)">Vedi Dettaglio</button>
          <div class="dettaglio-container" id="dettaglio-${a.IDallenamento}"></div>
        </div>
      `;
    }).join("");
  } catch {
    console.error("Errore caricamento allenamenti");
  }
}

async function toggleDettaglio(idAllenamento, btnObj) {
  const container = document.getElementById(`dettaglio-${idAllenamento}`);
  
  if (container.style.display === "block") {
    container.style.display = "none";
    btnObj.textContent = "Vedi Dettaglio";
    return;
  }

  // Se è già caricato, lo mostro solo
  if (container.innerHTML.trim() !== "") {
    container.style.display = "block";
    btnObj.textContent = "Nascondi Dettaglio";
    return;
  }

  // Altrimenti carico i dati
  try {
    const res = await fetch(`${API_URL}/me/allenamenti/${idAllenamento}/dettaglio`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Errore fetch dettaglio");
    const data = await res.json();
    const dettaglio = data.dettaglio || [];

    if (dettaglio.length === 0) {
      container.innerHTML = `<div class="empty-state">Nessun dettaglio presente per questo allenamento.</div>`;
      container.style.display = "block";
      btnObj.textContent = "Nascondi Dettaglio";
      return;
    }

    const html = dettaglio.map(sett => {
      const notaHtml = sett.nota ? `<div class="settimana-nota">Nota Istruttore: ${escHtml(sett.nota)}</div>` : "";
      
      const seduteHtml = sett.sedute.map(sed => {
        let esHtml = "";
        
        const renderRow = (nome, gg) => {
          const v = (val) => val ? `<td class="day-col has-value">${escHtml(val)}</td>` : `<td class="day-col">—</td>`;
          return `<tr>
            <td>${escHtml(nome)}</td>
            ${v(gg.lun)}${v(gg.mar)}${v(gg.mer)}${v(gg.gio)}${v(gg.ven)}${v(gg.sab)}${v(gg.dom)}
          </tr>`;
        };

        const thead = `<thead><tr><th>Esercizio</th><th class="day-col">L</th><th class="day-col">M</th><th class="day-col">M</th><th class="day-col">G</th><th class="day-col">V</th><th class="day-col">S</th><th class="day-col">D</th></tr></thead>`;

        if (sed.stretching.length > 0) {
          esHtml += `<div class="categoria-esercizi">
            <div class="categoria-titolo">Stretching</div>
            <div class="table-wrapper"><table class="dettaglio-table">${thead}<tbody>
              ${sed.stretching.map(s => renderRow(s.nome, s.giorni)).join('')}
            </tbody></table></div></div>`;
        }
        if (sed.riscaldamento.length > 0) {
          esHtml += `<div class="categoria-esercizi">
            <div class="categoria-titolo">Riscaldamento</div>
            <div class="table-wrapper"><table class="dettaglio-table">${thead}<tbody>
              ${sed.riscaldamento.map(r => renderRow(r.nome, r.giorni)).join('')}
            </tbody></table></div></div>`;
        }
        if (sed.tec_for_cor.length > 0) {
          const thTFC = `<thead><tr><th>Posizione</th><th>Distanza</th><th>Targa</th><th>Esercizio</th><th class="day-col">L</th><th class="day-col">M</th><th class="day-col">M</th><th class="day-col">G</th><th class="day-col">V</th><th class="day-col">S</th><th class="day-col">D</th></tr></thead>`;
          const trTFC = sed.tec_for_cor.map(t => {
            const v = (val) => val ? `<td class="day-col has-value">${escHtml(val)}</td>` : `<td class="day-col">—</td>`;
            return `<tr>
              <td>${escHtml(t.posizione_piedi)}</td><td>${escHtml(t.distanza)}</td><td>${escHtml(t.targa)}</td><td>${escHtml(t.esercizio)}</td>
              ${v(t.giorni.lun)}${v(t.giorni.mar)}${v(t.giorni.mer)}${v(t.giorni.gio)}${v(t.giorni.ven)}${v(t.giorni.sab)}${v(t.giorni.dom)}
            </tr>`;
          }).join('');
          esHtml += `<div class="categoria-esercizi">
            <div class="categoria-titolo">Tecnica / Forza / Coordinazione</div>
            <div class="table-wrapper"><table class="dettaglio-table">${thTFC}<tbody>${trTFC}</tbody></table></div></div>`;
        }
        if (sed.all_fis_for_res.length > 0) {
          const thAFFR = `<thead><tr><th>Tabella N°</th><th>Esercizio</th><th class="day-col">L</th><th class="day-col">M</th><th class="day-col">M</th><th class="day-col">G</th><th class="day-col">V</th><th class="day-col">S</th><th class="day-col">D</th></tr></thead>`;
          const trAFFR = sed.all_fis_for_res.map(a => {
            const v = (val) => val ? `<td class="day-col has-value">${escHtml(val)}</td>` : `<td class="day-col">—</td>`;
            return `<tr>
              <td>${escHtml(a.tabella_n)}</td><td>${escHtml(a.esercizio)}</td>
              ${v(a.giorni.lun)}${v(a.giorni.mar)}${v(a.giorni.mer)}${v(a.giorni.gio)}${v(a.giorni.ven)}${v(a.giorni.sab)}${v(a.giorni.dom)}
            </tr>`;
          }).join('');
          esHtml += `<div class="categoria-esercizi">
            <div class="categoria-titolo">All. Fisico Forza/Resistenza</div>
            <div class="table-wrapper"><table class="dettaglio-table">${thAFFR}<tbody>${trAFFR}</tbody></table></div></div>`;
        }
        if (sed.all_fis_cor.length > 0) {
          const thAFC = `<thead><tr><th>Attrezzo</th><th>Esercizio</th><th class="day-col">L</th><th class="day-col">M</th><th class="day-col">M</th><th class="day-col">G</th><th class="day-col">V</th><th class="day-col">S</th><th class="day-col">D</th></tr></thead>`;
          const trAFC = sed.all_fis_cor.map(a => {
            const v = (val) => val ? `<td class="day-col has-value">${escHtml(val)}</td>` : `<td class="day-col">—</td>`;
            return `<tr>
              <td>${escHtml(a.attrezzo)}</td><td>${escHtml(a.esercizio)}</td>
              ${v(a.giorni.lun)}${v(a.giorni.mar)}${v(a.giorni.mer)}${v(a.giorni.gio)}${v(a.giorni.ven)}${v(a.giorni.sab)}${v(a.giorni.dom)}
            </tr>`;
          }).join('');
          esHtml += `<div class="categoria-esercizi">
            <div class="categoria-titolo">All. Fisico Coordinazione</div>
            <div class="table-wrapper"><table class="dettaglio-table">${thAFC}<tbody>${trAFC}</tbody></table></div></div>`;
        }
        
        if (!esHtml) return "";

        return `
          <div class="seduta-block">
            <div class="seduta-title">Seduta ${sed.id_seduta}</div>
            ${esHtml}
          </div>
        `;
      }).join('');

      return `
        <div class="settimana-block">
          <div class="settimana-header">Settimana ${sett.id_settimana}</div>
          ${notaHtml}
          ${seduteHtml}
        </div>
      `;
    }).join("");

    container.innerHTML = html;
    container.style.display = "block";
    btnObj.textContent = "Nascondi Dettaglio";

  } catch (e) {
    console.error(e);
    alert("Errore nel caricamento del dettaglio.");
  }
}

// ══ VISITE ══
async function caricaVisite() {
  try {
    const res = await fetch(`${API_URL}/me/visite`, { headers: authHeaders() });
    if (!res.ok) return;
    const lista = await res.json();

    const box = document.getElementById("visiteList");
    const empty = document.getElementById("visiteEmpty");

    if (!lista.length) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    const oggi = new Date();
    box.innerHTML = lista.map((v) => {
      const valida = new Date(v.data_scadenza) >= oggi;
      return `
        <div class="info-card${valida ? " in-uso" : ""}">
          <div class="info-card-header">
            <span class="materiale-badge" style="background:${valida ? "#276749" : "#c53030"}">
              ${valida ? "Valida" : "Scaduta"}
            </span>
          </div>
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Data visita</span><span class="info-value">${formatDate(v.data_visita)}</span></div>
            <div class="info-item"><span class="info-label">Scadenza</span><span class="info-value">${formatDate(v.data_scadenza)}</span></div>
          </div>
        </div>
      `;
    }).join("");
  } catch {
    console.error("Errore caricamento visite");
  }
}

// ══ ANTIDOPING ══
async function caricaAntidoping() {
  try {
    const res = await fetch(`${API_URL}/me/antidoping`, { headers: authHeaders() });
    if (!res.ok) return;
    const lista = await res.json();

    const box = document.getElementById("antidopingList");
    const empty = document.getElementById("antidopingEmpty");

    if (!lista.length) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    box.innerHTML = lista.map((a) => `
      <div class="info-card${a.autorizzazione_fitarco ? " in-uso" : ""}">
        <div class="info-card-header">
          <span class="materiale-badge" style="background:${a.autorizzazione_fitarco ? "#276749" : "#c53030"}">
            ${a.autorizzazione_fitarco ? "Autorizzato" : "Non autorizzato"}
          </span>
        </div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Anno</span><span class="info-value">${a.anno}</span></div>
          <div class="info-item"><span class="info-label">Scadenza</span><span class="info-value">${formatDate(a.scadenza_autorizzazione)}</span></div>
        </div>
      </div>
    `).join("");
  } catch {
    console.error("Errore caricamento antidoping");
  }
}

// ══ PIANO GARE ══
async function caricaPianoGare() {
  try {
    const res = await fetch(`${API_URL}/me/piano-gare`, { headers: authHeaders() });
    if (!res.ok) return;
    const lista = await res.json();

    const box = document.getElementById("pianoGareList");
    const empty = document.getElementById("pianoGareEmpty");

    if (!lista.length) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    const oggi = new Date();
    box.innerHTML = lista.map((g) => {
      const futura = g.data ? new Date(g.data) >= oggi : false;
      return `
        <div class="info-card${futura ? " in-uso" : ""}">
          <div class="info-card-header">
            <span class="materiale-badge" style="background:${futura ? "#276749" : "#555"}">
              ${futura ? "In programma" : "Passata"}
            </span>
            <span class="info-date">${formatDate(g.data)}</span>
          </div>
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Tipo</span><span class="info-value">${g.tipo_gara || "—"}</span></div>
            <div class="info-item"><span class="info-label">Luogo</span><span class="info-value">${escHtml(g.luogo) || "—"}</span></div>
            <div class="info-item"><span class="info-label">Distanza</span><span class="info-value">${escHtml(g.distanza) || "—"}</span></div>
            ${g.note ? `<div class="info-item"><span class="info-label">Note</span><span class="info-value">${escHtml(g.note)}</span></div>` : ""}
          </div>
        </div>
      `;
    }).join("");
  } catch {
    console.error("Errore caricamento piano gare");
  }
}

// ══ PDF ══
function scaricaPDF() {
  const nome = document.getElementById("nomeAtleta")?.textContent?.trim().replace(/\s+/g, "_") || "profilo";
  html2pdf().set({
    margin: 10,
    filename: `${nome}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: "#111111" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  }).from(document.querySelector(".page")).save();
}

// ══ INIT ══
window.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  caricaProfilo();
  caricaMateriali();
  caricaAllenamenti();
  caricaVisite();
  caricaAntidoping();
  caricaPianoGare();
});