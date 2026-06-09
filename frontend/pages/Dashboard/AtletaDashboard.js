const API_URL = "http://localhost:8000";

let currentUser    = null;
let myProfile      = null;
let myAllenamenti  = [];
let totalNote      = 0;

// nota modal state
let _notaAllId  = null;
let _notaSett   = null;

/* ── API ────────────────────────────────── */
function authHeader() {
    return {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json"
    };
}

async function api(method, path, body = null) {
    const opts = { method, headers: authHeader() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${path}`, opts);
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Errore server");
    }
    return res.status === 204 ? null : res.json();
}

/* ── AUTH ───────────────────────────────── */
function logout() {
    localStorage.clear();
    location.href = "../../index.html";
}

/* ── INIT ───────────────────────────────── */
async function init() {
    currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) { logout(); return; }
    if (currentUser.role !== "atleta") {
        location.href = currentUser.role === "istruttore"
            ? "Dashboard.html"
            : "../../index.html";
        return;
    }
    document.getElementById("navUser").textContent = currentUser.email;
    await loadAll();
}

async function loadAll() {
    try {
        const [profile, allenamenti, materiali] = await Promise.all([
            api("GET", "/atleta/me").catch(() => null),
            api("GET", "/atleta/me/allenamenti").catch(() => []),
            api("GET", "/atleta/me/materiali").catch(() => []),
        ]);

        if (!profile) {
            document.getElementById("noProfileEmail").textContent = currentUser.email;
            document.getElementById("noProfile").style.display    = "flex";
            document.getElementById("mainContent").style.display  = "none";
            return;
        }

        myProfile     = profile;
        myAllenamenti = allenamenti || [];

        document.getElementById("mainContent").style.display = "block";
        document.getElementById("noProfile").style.display   = "none";

        renderHeader(profile);
        renderStatistiche(myAllenamenti);
        renderCalendario(myAllenamenti);
        renderObiettivoSettimanale(myAllenamenti);
        renderNoteIstruttore(myAllenamenti);
        await renderAllenamenti(myAllenamenti);
        renderMateriali(materiali || []);

    } catch (e) {
        console.error(e);
    }
}

/* ── HEADER ─────────────────────────────── */
function renderHeader(p) {
    const nome = [p.Nome, p.Cognome].filter(Boolean).join(" ") || currentUser.email;
    document.getElementById("atletaNome").textContent = nome;

    const info = [p.CITTA, p.DataNascita ? `Nato/a il ${p.DataNascita}` : ""].filter(Boolean).join(" · ");
    document.getElementById("atletaInfo").textContent = info || "—";
}

/* ── ALLENAMENTI ────────────────────────── */
async function renderAllenamenti(list) {
    const container = document.getElementById("allenamentiList");
    document.getElementById("cntAll").textContent = list.length;

    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">Nessun allenamento assegnato.</div>`;
        document.getElementById("cntSettimane").textContent = "—";
        return;
    }

    // primo (più recente) per le stats
    const primo = list[0];
    const settPrimo = calcolaSettimane(primo.DataInizio, primo.DataFine);
    document.getElementById("cntSettimane").textContent = settPrimo;

    // caricare le note per tutti gli allenamenti per conteggio
    let totNote = 0;

    const cards = await Promise.all(list.map(async (all) => {
        const numSett = calcolaSettimane(all.DataInizio, all.DataFine);
        const settimane = buildSettimane(all.DataInizio, numSett);

        // carica conteggio note per ogni settimana
        const noteCounts = await Promise.all(
            settimane.map(s =>
                api("GET", `/atleta/me/allenamenti/${all.IDallenamento}/settimana/${s.num}/note`)
                    .catch(() => [])
            )
        );
        const totNoteAll = noteCounts.reduce((acc, n) => acc + n.length, 0);
        totNote += totNoteAll;

        const settHtml = settimane.map((s, i) => {
            const n = noteCounts[i] ? noteCounts[i].length : 0;
            return `
              <div class="sett-card">
                <div class="sett-title">Settimana ${s.num}</div>
                <div class="sett-dates">${s.dal} → ${s.al}</div>
                <div class="sett-note-count">Note: <strong>${n}</strong></div>
                <button class="btn-nota"
                  onclick="openNotaModal(${all.IDallenamento},${s.num})">
                  📝 Note personali
                </button>
              </div>`;
        }).join("");

        return `
          <div class="all-card">
            <div class="all-header" onclick="toggleAll(this)">
              <div class="all-header-left">
                <div class="all-dates">${all.DataInizio} → ${all.DataFine}</div>
                <div class="all-obiettivi">${all.Obiettivi || "Nessun obiettivo specificato"}</div>
              </div>
              <div class="all-header-right">
                <span class="all-weeks-badge">${numSett} ${numSett === 1 ? "settimana" : "settimane"}</span>
                <span class="all-toggle">▼</span>
              </div>
            </div>
            <div class="all-body">
              <div class="settimane-grid">${settHtml}</div>
            </div>
          </div>`;
    }));

    container.innerHTML = cards.join("");
    totalNote = totNote;
    document.getElementById("cntNote").textContent = totNote;
}

function toggleAll(header) {
    const body   = header.nextElementSibling;
    const toggle = header.querySelector(".all-toggle");
    const open   = body.classList.toggle("open");
    toggle.classList.toggle("open", open);
}

function calcolaSettimane(dataInizio, dataFine) {
    const ms = new Date(dataFine) - new Date(dataInizio);
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24 * 7)));
}

function buildSettimane(dataInizio, numSett) {
    const start = new Date(dataInizio);
    const sett  = [];
    for (let i = 0; i < numSett; i++) {
        const dal = new Date(start); dal.setDate(dal.getDate() + i * 7);
        const al  = new Date(dal);   al.setDate(al.getDate() + 6);
        sett.push({
            num: i + 1,
            dal: dal.toISOString().slice(0, 10),
            al:  al.toISOString().slice(0, 10),
        });
    }
    return sett;
}

/* ── MATERIALI ──────────────────────────── */
function renderMateriali(list) {
    const container = document.getElementById("materialiList");
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">Nessun materiale registrato.</div>`;
        return;
    }

    const CAMPI = [
        ["Riser","Riser"],["LunghezzaRiser","Lunghezza Riser"],
        ["Flettenti","Flettenti"],["LunghezzaFlettenti","Lunghezza Flettenti"],
        ["PotenzaNominale","Potenza Nominale"],["Rest","Rest"],
        ["Mirino","Mirino"],["Stabilizzazione","Stabilizzazione"],
        ["Aste","Aste"],["LunghezzaAste","Lunghezza Aste"],
        ["Punte","Punte"],["PesoPunte","Peso Punte"],
        ["Cocche","Cocche"],["Alette","Alette"],
        ["LunghezzaAlette","Lunghezza Alette"],["Spine","Spine"],
        ["Corda","Corda"],["Fili","Fili"],
        ["Patella","Patella"],["Bottone","Bottone"],
        ["Molla","Molla"],["TillerSuperiore","Tiller Sup."],
        ["TillerInferiore","Tiller Inf."],["Brace","Brace"],
        ["Allungo","Allungo"],["PotenzaReale","Potenza Reale"],
        ["PuntoIncocco","Punto Innocco"],
    ];

    container.innerHTML = list.map(m => {
        const campiHtml = CAMPI
            .filter(([k]) => m[k] !== null && m[k] !== "" && m[k] !== undefined)
            .map(([k, label]) => `
              <div class="mat-field">
                <span>${label}</span>
                <strong>${m[k]}</strong>
              </div>`).join("");

        return `
          <div class="mat-card">
            <div style="display:flex;align-items:center;margin-bottom:4px">
              <strong>Scheda del ${m.Data || "—"}</strong>
              ${m.MaterialeCorrente ? '<span class="mat-badge-corrente">Corrente</span>' : ""}
            </div>
            <div class="mat-grid">${campiHtml || '<span style="color:var(--muted)">Nessun dettaglio registrato.</span>'}</div>
          </div>`;
    }).join("");
}

/* ── MODAL NOTE ─────────────────────────── */
async function openNotaModal(idAllenamento, idSettimana) {
    _notaAllId = idAllenamento;
    _notaSett  = idSettimana;
    document.getElementById("notaModalTitle").textContent = `Settimana ${idSettimana}`;
    document.getElementById("notaInput").value = "";
    document.getElementById("notaMsg").textContent = "";
    await reloadNote();
    document.getElementById("notaModal").classList.add("open");
}

function closeNotaModal() {
    document.getElementById("notaModal").classList.remove("open");
    loadAll();   // refresh counts
}

async function reloadNote() {
    const list = await api("GET",
        `/atleta/me/allenamenti/${_notaAllId}/settimana/${_notaSett}/note`
    ).catch(() => []);

    const el = document.getElementById("noteEsistenti");
    if (!list || list.length === 0) {
        el.innerHTML = `<p style="color:var(--muted);font-size:0.82rem;margin-bottom:8px">Nessuna nota per questa settimana.</p>`;
        return;
    }
    el.innerHTML = list.map(n => `
        <div class="nota-item">
            <p>${n.Nota}</p>
            <button class="btn-del-nota" onclick="eliminaNota(${n.IDnota})">✕</button>
        </div>`).join("");
}

async function salvaNota() {
    const testo = document.getElementById("notaInput").value.trim();
    if (!testo) return;
    try {
        await api("POST",
            `/atleta/me/allenamenti/${_notaAllId}/settimana/${_notaSett}/note`,
            { nota: testo }
        );
        document.getElementById("notaInput").value = "";
        document.getElementById("notaMsg").textContent = "";
        await reloadNote();
    } catch (e) {
        document.getElementById("notaMsg").textContent = "Errore: " + e.message;
        document.getElementById("notaMsg").style.color = "#fc8181";
    }
}

async function eliminaNota(idNota) {
    if (!confirm("Eliminare questa nota?")) return;
    await api("DELETE", `/atleta/me/note/${idNota}`).catch(() => {});
    await reloadNote();
}

/* ── ULTIME STATISTICHE ─────────────────── */
function renderStatistiche(allenamenti) {
    // Placeholder visivo — i dati reali arriveranno da /atleta/me/statistiche (da implementare)
    const corrente = trovaPianoCorrente(allenamenti);
    document.getElementById("sdrData").textContent = corrente
        ? formatData(corrente.DataInizio)
        : "Nessun piano attivo";
    aggiornaAnelloAccuratezza(null);
}

function aggiornaAnelloAccuratezza(pct) {
    const anello  = document.getElementById("accuracyRing");
    const testoEl = document.getElementById("accuracyPct");
    const C = 314.16; // 2πr con r=50

    if (pct === null || pct === undefined) {
        anello.style.stroke = "#2a2a2a";
        anello.setAttribute("stroke-dashoffset", C.toString());
        testoEl.textContent = "—";
        return;
    }

    const valore = Math.min(100, Math.max(0, pct));
    anello.setAttribute("stroke-dashoffset", (C - (valore / 100) * C).toString());
    testoEl.textContent = valore + "%";

    // Colore ispirato ai cerchi del bersaglio di tiro con l'arco
    if (valore >= 90)      anello.style.stroke = "#FFD700"; // oro   — eccellente (10-9)
    else if (valore >= 75) anello.style.stroke = "#fc8181"; // rosso — buono      (8-7)
    else if (valore >= 55) anello.style.stroke = "#63b3ed"; // blu   — discreto   (6-5)
    else                   anello.style.stroke = "#888";    // grigio — da migliorare
}

/* ── CALENDARIO SESSIONI ────────────────── */
function renderCalendario(allenamenti) {
    const contenitore = document.getElementById("calendarList");
    const MESI = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
    const oggi = new Date(); oggi.setHours(0, 0, 0, 0);

    if (!allenamenti || allenamenti.length === 0) {
        contenitore.innerHTML = `<div class="empty-state">Nessun piano di allenamento assegnato.</div>`;
        return;
    }

    // Ordina: attivi prima, poi futuri, poi passati
    const piani = [...allenamenti].sort((a, b) => {
        const statoA = statoAllenamento(a, oggi);
        const statoB = statoAllenamento(b, oggi);
        const priorita = { attivo: 0, prossimo: 1, passato: 2 };
        return priorita[statoA] - priorita[statoB] || new Date(a.DataInizio) - new Date(b.DataInizio);
    });

    contenitore.innerHTML = piani.map(p => {
        const inizio  = new Date(p.DataInizio);
        const stato   = statoAllenamento(p, oggi);
        const sett    = calcolaSettimane(p.DataInizio, p.DataFine);
        const etichetta = { attivo: "In corso", prossimo: "Prossimo", passato: "Completato" }[stato];

        return `
          <div class="cal-card">
            <div class="cal-date-block">
              <div class="cal-day">${String(inizio.getDate()).padStart(2,"0")}</div>
              <div class="cal-month">${MESI[inizio.getMonth()]}</div>
            </div>
            <div class="cal-body">
              <div class="cal-title">${troncaTesto(p.Obiettivi || "Piano di allenamento", 65)}</div>
              <div class="cal-range">
                ${formatData(p.DataInizio)} → ${formatData(p.DataFine)}
                &nbsp;·&nbsp; ${sett} ${sett === 1 ? "settimana" : "settimane"}
              </div>
            </div>
            <span class="cal-badge cal-badge-${stato}">${etichetta}</span>
          </div>`;
    }).join("");
}

function statoAllenamento(piano, oggi) {
    const ini = new Date(piano.DataInizio);
    const fin = new Date(piano.DataFine);
    if (fin < oggi)  return "passato";
    if (ini > oggi)  return "prossimo";
    return "attivo";
}

/* ── OBIETTIVO SETTIMANALE ──────────────── */
function renderObiettivoSettimanale(allenamenti) {
    const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
    const MESI = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];

    const corrente = trovaPianoCorrente(allenamenti);
    if (!corrente) {
        document.getElementById("progressStatus").textContent = "Nessun piano attivo questa settimana";
        return;
    }

    // Calcola settimana corrente all'interno del piano
    const numSett   = settimanaCorrente(corrente.DataInizio, oggi);
    const iniSett   = new Date(corrente.DataInizio);
    iniSett.setDate(iniSett.getDate() + (numSett - 1) * 7);
    const finSett   = new Date(iniSett);
    finSett.setDate(finSett.getDate() + 6);

    document.getElementById("weekRangeLabel").textContent =
        `Settimana ${numSett}  ·  ${iniSett.getDate()} ${MESI[iniSett.getMonth()]} – ${finSett.getDate()} ${MESI[finSett.getMonth()]}`;

    // Prova a estrarre un numero di frecce dall'obiettivo (es. "300 frecce")
    const match    = (corrente.Obiettivi || "").match(/(\d+)\s*frecce?/i);
    const obiettivo = match ? parseInt(match[1]) : null;

    if (obiettivo) {
        // Frequenza reale: verrà da /atleta/me/statistiche/settimana — per ora 0
        impostaProgressBar(0, obiettivo);
    } else {
        document.getElementById("progressRatio").textContent  = "—";
        document.getElementById("progressPct").textContent    = "—";
        document.getElementById("progressStatus").textContent = "Specifica un obiettivo numerico nel piano (es. '300 frecce')";
    }
}

function impostaProgressBar(correnti, obiettivo) {
    const pct  = Math.min(100, Math.round((correnti / obiettivo) * 100));
    const stato = pct >= 100 ? "Obiettivo raggiunto! 🎯"
                : pct >= 75  ? "Quasi ci sei, continua così!"
                : pct >= 50  ? "Buona progressione!"
                :              "Inizia la sessione di allenamento!";

    document.getElementById("weeklyBar").style.width       = Math.max(3, pct) + "%";
    document.getElementById("progressRatio").textContent   = `${correnti} / ${obiettivo} frecce`;
    document.getElementById("progressPct").textContent     = pct + "%";
    document.getElementById("progressStatus").textContent  = stato;
}

function settimanaCorrente(dataInizio, oggi) {
    const diff = oggi - new Date(dataInizio);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)));
}

/* ── NOTE ISTRUTTORE ────────────────────── */
function renderNoteIstruttore(allenamenti) {
    const contenitore = document.getElementById("noteIstruttoreList");

    // Usa gli Obiettivi dei piani come note del coach verso l'atleta
    const conNote = (allenamenti || [])
        .filter(a => a.Obiettivi && a.Obiettivi.trim() !== "")
        .sort((a, b) => new Date(b.DataInizio) - new Date(a.DataInizio));

    if (conNote.length === 0) {
        contenitore.innerHTML = `<div class="empty-state">Nessuna nota dell'istruttore disponibile.</div>`;
        return;
    }

    contenitore.innerHTML = conNote.map(p => {
        const sett       = calcolaSettimane(p.DataInizio, p.DataFine);
        const paragrafi  = p.Obiettivi
            .split(/\n+/)
            .filter(r => r.trim())
            .map(r => `<p>${r.trim()}</p>`)
            .join("") || `<p>${p.Obiettivi}</p>`;

        return `
          <div class="note-istr-card">
            <div class="ni-header">
              <div class="ni-coach-info">
                <div class="ni-avatar">🏹</div>
                <div>
                  <div class="ni-coach-name">Istruttore</div>
                  <div class="ni-date">Piano dal ${formatData(p.DataInizio)} · ${sett} ${sett === 1 ? "settimana" : "settimane"}</div>
                </div>
              </div>
              <span class="ni-tag">Obiettivi del piano</span>
            </div>
            <div class="ni-divider"></div>
            <div class="ni-body">${paragrafi}</div>
          </div>`;
    }).join("");
}

/* ── UTILITÀ ─────────────────────────────── */
function trovaPianoCorrente(allenamenti) {
    const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
    return (allenamenti || []).find(a =>
        new Date(a.DataInizio) <= oggi && new Date(a.DataFine) >= oggi
    ) || null;
}

function formatData(dataStr) {
    if (!dataStr) return "—";
    const parti = dataStr.split("-");
    if (parti.length !== 3) return dataStr;
    const MESI = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
    return `${parti[2]} ${MESI[parseInt(parti[1]) - 1]} ${parti[0]}`;
}

function troncaTesto(testo, max) {
    return testo.length > max ? testo.slice(0, max) + "…" : testo;
}

/* ── BOOTSTRAP ──────────────────────────── */
document.querySelectorAll(".overlay").forEach(el => {
    el.addEventListener("click", e => { if (e.target === el) closeNotaModal(); });
});

init();
