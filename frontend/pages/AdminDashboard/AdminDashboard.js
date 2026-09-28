const API_URL = "http://localhost:8000";

let istruttori = [];
let utenti = [];
let atleti = [];
let atletiViewMode = 'list'; // 'list' | 'grouped'

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadAllDashboardData();
});

async function loadAllDashboardData() {
    await Promise.all([
        loadIstruttori(),
        loadUtenti(),
        loadAtleti()
    ]);
}

function switchTab(tabName) {
    const secIstr = document.getElementById("sectionIstruttori");
    const secUt = document.getElementById("sectionUtenti");
    const secAtl = document.getElementById("sectionAtleti");

    const btnIstr = document.getElementById("tabBtnIstruttori");
    const btnUt = document.getElementById("tabBtnUtenti");
    const btnAtl = document.getElementById("tabBtnAtleti");

    if (secIstr) secIstr.style.display = tabName === 'istruttori' ? 'block' : 'none';
    if (secUt) secUt.style.display = tabName === 'utenti' ? 'block' : 'none';
    if (secAtl) secAtl.style.display = tabName === 'atleti' ? 'block' : 'none';

    if (btnIstr) btnIstr.classList.toggle("active", tabName === 'istruttori');
    if (btnUt) btnUt.classList.toggle("active", tabName === 'utenti');
    if (btnAtl) btnAtl.classList.toggle("active", tabName === 'atleti');
}

function parseToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function checkAuth() {
    const token = localStorage.getItem("access_token");
    if (!token) {
        logout();
        return;
    }
    const payload = parseToken(token);
    if (!payload || payload.ruolo !== "admin") {
        alert("Accesso negato: richiesti privilegi di amministratore.");
        logout();
        return;
    }
    document.getElementById("navUser").textContent = payload.sub || "Admin";

    // Carica profilo per mostrare l'username se presente
    fetch(`${API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : null)
    .then(me => {
        if (me && me.username) {
            document.getElementById("navUser").textContent = me.username;
        }
    })
    .catch(() => {});
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

// ══════════════════════════════════════════════
// CARICAMENTO & GESTIONE ISTRUTTORI
// ══════════════════════════════════════════════
async function loadIstruttori() {
    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_URL}/admin/istruttori`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) logout();
            throw new Error("Errore caricamento istruttori");
        }
        istruttori = await res.json();
        renderTable(istruttori);
        updateIstruttoreFilterDropdown();
    } catch (err) {
        console.error(err);
    }
}

function updateIstruttoreFilterDropdown() {
    const select = document.getElementById("filterIstruttoreAtleti");
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">Tutti gli Istruttori</option>';
    istruttori.forEach(i => {
        const opt = document.createElement("option");
        opt.value = i.IDistruttore;
        opt.textContent = `${i.Nome} ${i.Cognome}`;
        select.appendChild(opt);
    });
    select.value = currentVal;
}

function renderTable(data) {
    const tbody = document.getElementById("istruttoriBody");
    const emptyState = document.getElementById("emptyState");
    const cntElem = document.getElementById("cntIstruttori");
    if (cntElem) cntElem.textContent = istruttori.length;

    tbody.innerHTML = "";
    if (data.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
        data.forEach(istr => {
            const tr = document.createElement("tr");
            tr.className = "row-clickable";
            
            const isSospeso = istr.sospeso_fino_al && new Date(istr.sospeso_fino_al) >= new Date();
            const statusBadge = isSospeso 
                ? `<span class="badge badge-sospeso" style="margin-left: 6px;">Sospeso</span>`
                : '';

            tr.innerHTML = `
                <td>${istr.IDistruttore}</td>
                <td><strong>${istr.Nome}</strong>${statusBadge}</td>
                <td><strong>${istr.Cognome}</strong></td>
                <td>${istr.Qualifica || "-"}</td>
                <td>${istr["E-mail"]}</td>
                <td>
                    <button class="btn btn-red" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;" onclick="viewAtleti(${istr.IDistruttore}, '${istr.Nome.replace(/'/g, "\\'")}', '${istr.Cognome.replace(/'/g, "\\'")}', event)">Atleti</button>
                    <button class="btn btn-red" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px; background: #3b82f6; border-color: #3b82f6;" onclick="openEditModal(${istr.IDistruttore}, event)">Modifica</button>
                    <button class="btn btn-red" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px; background: #f59e0b; border-color: #f59e0b;" onclick="openSuspendModal(${istr.IDistruttore}, event)">Sospendi</button>
                    <button class="btn btn-red" style="padding: 5px 10px; font-size: 0.8rem;" onclick="eliminaIstruttore(${istr.IDistruttore}, event)">Elimina</button>
                </td>
            `;
            tr.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    viewAtleti(istr.IDistruttore, istr.Nome, istr.Cognome, e);
                }
            };
            tbody.appendChild(tr);
        });
    }
}

function filterTable() {
    const q = document.getElementById("searchInput").value.toLowerCase();
    const filtered = istruttori.filter(i => 
        (i.Nome || "").toLowerCase().includes(q) ||
        (i.Cognome || "").toLowerCase().includes(q) ||
        (i["E-mail"] || "").toLowerCase().includes(q)
    );
    renderTable(filtered);
}


// AGGIUNTA ISTRUTTORE
function openAddModal() {
    document.getElementById("addNome").value = "";
    document.getElementById("addCognome").value = "";
    document.getElementById("addEmail").value = "";
    document.getElementById("addUsername").value = "";
    document.getElementById("addQualifica").value = "";
    document.getElementById("addMsgBox").className = "msg-box";
    document.getElementById("addModal").classList.add("open");
}

function closeAddModal() {
    document.getElementById("addModal").classList.remove("open");
}

async function salvaIstruttore() {
    const nome = document.getElementById("addNome").value.trim();
    const cognome = document.getElementById("addCognome").value.trim();
    const email = document.getElementById("addEmail").value.trim();
    const username = document.getElementById("addUsername").value.trim();
    const qualifica = document.getElementById("addQualifica").value.trim();

    if (!nome || !cognome || !email) {
        showMsg("addMsgBox", "Compila nome, cognome ed email", "error");
        return;
    }

    const payload = { nome, cognome, email, qualifica, username: username || null };
    const btn = document.getElementById("btnSalva");
    btn.disabled = true;
    btn.textContent = "Salvataggio...";

    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_URL}/admin/istruttori`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(()=>({}));
            throw new Error(err.detail || "Errore durante il salvataggio");
        }

        closeAddModal();
        loadAllDashboardData();
    } catch (err) {
        showMsg("addMsgBox", err.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Salva";
    }
}

// VISUALIZZAZIONE ATLETI
async function viewAtleti(idIstruttore, nome, cognome, event) {
    if(event) event.stopPropagation();
    
    document.getElementById("atletiModalTitle").textContent = `Atleti di ${nome} ${cognome}`;
    const tbody = document.getElementById("atletiBody");
    const emptyState = document.getElementById("emptyAtletiState");
    tbody.innerHTML = "";
    emptyState.style.display = "none";
    
    document.getElementById("atletiModal").classList.add("open");

    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_URL}/admin/istruttori/${idIstruttore}/atleti`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error("Errore nel recupero atleti");
        
        const data = await res.json();
        
        if (data.length === 0) {
            emptyState.style.display = "block";
        } else {
            data.forEach(atleta => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${atleta.nome}</td>
                    <td>${atleta.cognome}</td>
                    <td>${atleta.codice_fiscale}</td>
                    <td>${atleta.email || "-"}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
        emptyState.style.display = "block";
        emptyState.innerHTML = `<p style="color:red">Errore di caricamento</p>`;
    }
}

function closeAtletiModal() {
    document.getElementById("atletiModal").classList.remove("open");
}

// MODIFICA ISTRUTTORE
function openEditModal(id, event) {
    if(event) event.stopPropagation();
    const istr = istruttori.find(i => i.IDistruttore === id);
    if (!istr) return;

    document.getElementById("editId").value = istr.IDistruttore;
    document.getElementById("editNome").value = istr.Nome || "";
    document.getElementById("editCognome").value = istr.Cognome || "";
    document.getElementById("editEmail").value = istr["E-mail"] || "";
    document.getElementById("editUsername").value = istr.Username || "";
    document.getElementById("editQualifica").value = istr.Qualifica || "";
    document.getElementById("editMsgBox").className = "msg-box";
    document.getElementById("editModal").classList.add("open");
}

function closeEditModal() {
    document.getElementById("editModal").classList.remove("open");
}

async function salvaModificheIstruttore() {
    const id = document.getElementById("editId").value;
    const nome = document.getElementById("editNome").value.trim();
    const cognome = document.getElementById("editCognome").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const username = document.getElementById("editUsername").value.trim();
    const qualifica = document.getElementById("editQualifica").value.trim();

    if (!nome || !cognome || !email) {
        showMsg("editMsgBox", "Compila nome, cognome ed email", "error");
        return;
    }

    const payload = { nome, cognome, email, username, qualifica };
    const btn = document.getElementById("btnEditSalva");
    btn.disabled = true;
    btn.textContent = "Salvataggio...";

    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_URL}/admin/istruttori/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(()=>({}));
            throw new Error(err.detail || "Errore durante il salvataggio");
        }

        closeEditModal();
        loadAllDashboardData();
    } catch (err) {
        showMsg("editMsgBox", err.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Salva";
    }
}

// ELIMINA ISTRUTTORE
async function eliminaIstruttore(id, event) {
    if(event) event.stopPropagation();
    if (!confirm("Sei sicuro di voler eliminare questo istruttore? L'azione è irreversibile e comporterà anche l'eliminazione dell'account utente associato.")) return;

    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_URL}/admin/istruttori/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error("Errore durante l'eliminazione");
        loadAllDashboardData();
    } catch (err) {
        alert(err.message);
    }
}

// SOSPENSIONE ISTRUTTORE
function openSuspendModal(id, event) {
    if(event) event.stopPropagation();
    document.getElementById("suspendId").value = id;
    document.getElementById("suspendDuration").value = "";
    document.getElementById("suspendMsgBox").className = "msg-box";
    document.getElementById("suspendModal").classList.add("open");
}

function closeSuspendModal() {
    document.getElementById("suspendModal").classList.remove("open");
}

async function salvaSospensione() {
    const id = document.getElementById("suspendId").value;
    const durationStr = document.getElementById("suspendDuration").value;
    
    let data_fine_sospensione = null;
    if (durationStr) {
        const years = parseInt(durationStr, 10);
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + years);
        data_fine_sospensione = endDate.toISOString().split('T')[0]; // format YYYY-MM-DD
    }

    const payload = { data_fine_sospensione };
    const btn = document.getElementById("btnSuspendSalva");
    btn.disabled = true;
    btn.textContent = "Applicazione...";

    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_URL}/admin/istruttori/${id}/sospendi`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(()=>({}));
            throw new Error(err.detail || "Errore durante la sospensione");
        }

        closeSuspendModal();
        loadAllDashboardData();
    } catch (err) {
        showMsg("suspendMsgBox", err.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Applica";
    }
}

// ══════════════════════════════════════════════
// GESTIONE PROFILO ADMIN
// ══════════════════════════════════════════════

async function openProfileModal() {
    const token = localStorage.getItem("access_token");
    const msgBox = document.getElementById("profileMsgBox");
    if (msgBox) msgBox.className = "msg-box";

    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Impossibile caricare i dati del profilo");

        const data = await res.json();
        document.getElementById("profileEmail").value = data.email || "";
        document.getElementById("profileUsername").value = data.username || "";
        document.getElementById("profileModal").classList.add("open");
    } catch (err) {
        alert(err.message);
    }
}

function closeProfileModal() {
    document.getElementById("profileModal").classList.remove("open");
}

async function salvaProfilo() {
    const username = document.getElementById("profileUsername").value.trim();
    const btn = document.getElementById("btnProfileSalva");
    btn.disabled = true;
    btn.textContent = "Salvataggio...";

    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_URL}/auth/username`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ username: username || null })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showMsg("profileMsgBox", data.detail || "Errore durante il salvataggio", "error");
            return;
        }

        showMsg("profileMsgBox", "Profilo aggiornato con successo!", "success");
        document.getElementById("navUser").textContent = username || document.getElementById("profileEmail").value;
        setTimeout(() => {
            closeProfileModal();
        }, 1200);

    } catch (err) {
        showMsg("profileMsgBox", "Errore di connessione", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Salva";
    }
}

// ══════════════════════════════════════════════
// TUTTI GLI UTENTI IN READ-ONLY
// ══════════════════════════════════════════════
async function loadUtenti() {
    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_URL}/admin/utenti`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Errore caricamento utenti");
        utenti = await res.json();
        const cntElem = document.getElementById("cntUtenti");
        if (cntElem) cntElem.textContent = utenti.length;
        filterUtentiTable();
    } catch (err) {
        console.error("Errore caricamento utenti:", err);
    }
}

function filterUtentiTable() {
    const q = (document.getElementById("searchUtentiInput")?.value || "").toLowerCase().trim();
    const ruoloFilter = (document.getElementById("filterRuoloUtenti")?.value || "").toLowerCase().trim();
    const statoFilter = (document.getElementById("filterStatoUtenti")?.value || "").toLowerCase().trim();

    const now = new Date();

    const filtered = utenti.filter(u => {
        // Ricerca testuale
        const matchText = !q ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.username || "").toLowerCase().includes(q) ||
            (u.nome || "").toLowerCase().includes(q) ||
            (u.cognome || "").toLowerCase().includes(q) ||
            (u.codice_fiscale || "").toLowerCase().includes(q);

        // Filtro Ruolo
        const matchRuolo = !ruoloFilter || (u.ruolo || "").toLowerCase() === ruoloFilter;

        // Filtro Stato
        const isSospeso = u.sospeso_fino_al && new Date(u.sospeso_fino_al) >= now;
        const isBloccato = u.bloccato_fino_al && new Date(u.bloccato_fino_al) >= now;
        let matchStato = true;
        if (statoFilter === "attivo") {
            matchStato = !isSospeso && !isBloccato;
        } else if (statoFilter === "sospeso") {
            matchStato = isSospeso;
        } else if (statoFilter === "bloccato") {
            matchStato = isBloccato;
        }

        return matchText && matchRuolo && matchStato;
    });

    renderUtentiTable(filtered);
}

function renderUtentiTable(data) {
    const tbody = document.getElementById("utentiBody");
    const emptyState = document.getElementById("emptyUtentiState");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (data.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }
    if (emptyState) emptyState.style.display = "none";

    const now = new Date();

    data.forEach(u => {
        const tr = document.createElement("tr");

        // Ruolo Badge
        let roleBadgeClass = "badge-atleta";
        let roleLabel = u.ruolo || "Utente";
        if (u.ruolo === "admin") {
            roleBadgeClass = "badge-admin";
            roleLabel = "Admin";
        } else if (u.ruolo === "istruttore") {
            roleBadgeClass = "badge-istruttore";
            roleLabel = "Istruttore";
        } else if (u.ruolo === "atleta") {
            roleBadgeClass = "badge-atleta";
            roleLabel = "Atleta";
        }
        const roleBadge = `<span class="badge ${roleBadgeClass}">${roleLabel}</span>`;

        // Stato Account Badge
        const isSospeso = u.sospeso_fino_al && new Date(u.sospeso_fino_al) >= now;
        const isBloccato = u.bloccato_fino_al && new Date(u.bloccato_fino_al) >= now;
        let statoBadge = `<span class="badge badge-attivo">Attivo</span>`;
        if (isSospeso) {
            const d = new Date(u.sospeso_fino_al).toLocaleDateString('it-IT');
            statoBadge = `<span class="badge badge-sospeso" title="Sospeso fino al ${d}">Sospeso fino al ${d}</span>`;
        } else if (isBloccato) {
            statoBadge = `<span class="badge badge-bloccato" title="Account bloccato per tentativi multipli falliti">Bloccato Sicurezza</span>`;
        }

        // Dettaglio Anagrafico
        let anagrafica = "-";
        if (u.nome || u.cognome) {
            anagrafica = `<strong>${u.nome || ""} ${u.cognome || ""}</strong>`;
            if (u.qualifica) {
                anagrafica += `<br><small style="color: #94a3b8;">${u.qualifica}</small>`;
            } else if (u.codice_fiscale) {
                anagrafica += `<br><small style="color: #94a3b8; font-family: monospace;">CF: ${u.codice_fiscale}</small>`;
            }
        } else if (u.ruolo === "admin") {
            anagrafica = `<strong style="color: #f87171;">Amministratore di Sistema</strong>`;
        }

        // Data registrazione
        let dataCreazione = "-";
        if (u.creato_il) {
            dataCreazione = new Date(u.creato_il).toLocaleDateString('it-IT', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        }

        tr.innerHTML = `
            <td>${u.IDutente}</td>
            <td>${roleBadge}</td>
            <td>${anagrafica}</td>
            <td><code style="color: #cbd5e1;">${u.username || "-"}</code></td>
            <td>${u.email}</td>
            <td>${statoBadge}</td>
            <td style="color: #888;">${dataCreazione}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ══════════════════════════════════════════════
// ATLETI E RAGGRUPPAMENTO PER ISTRUTTORE
// ══════════════════════════════════════════════
async function loadAtleti() {
    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_URL}/admin/atleti`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Errore caricamento atleti");
        atleti = await res.json();
        const cntElem = document.getElementById("cntAtleti");
        if (cntElem) cntElem.textContent = atleti.length;
        renderAtleti();
    } catch (err) {
        console.error("Errore caricamento atleti:", err);
    }
}

function setAtletiViewMode(mode) {
    atletiViewMode = mode;
    const btnList = document.getElementById("btnViewList");
    const btnGroup = document.getElementById("btnViewGrouped");
    if (btnList) btnList.classList.toggle("active", mode === 'list');
    if (btnGroup) btnGroup.classList.toggle("active", mode === 'grouped');
    renderAtleti();
}

function renderAtleti() {
    const q = (document.getElementById("searchAtletiInput")?.value || "").toLowerCase().trim();
    const idIstruttoreFilter = document.getElementById("filterIstruttoreAtleti")?.value || "";

    const filtered = atleti.filter(a => {
        const matchText = !q ||
            (a.nome || "").toLowerCase().includes(q) ||
            (a.cognome || "").toLowerCase().includes(q) ||
            (a.codice_fiscale || "").toLowerCase().includes(q) ||
            (a.email || "").toLowerCase().includes(q) ||
            (a.citta || "").toLowerCase().includes(q) ||
            (a.istruttore_nome || "").toLowerCase().includes(q);

        const matchIstruttore = !idIstruttoreFilter || String(a.IDistruttore) === String(idIstruttoreFilter);

        return matchText && matchIstruttore;
    });

    const listView = document.getElementById("atletiListView");
    const groupedView = document.getElementById("atletiGroupedView");

    if (atletiViewMode === 'list') {
        if (listView) listView.style.display = "block";
        if (groupedView) groupedView.style.display = "none";
        renderAtletiList(filtered);
    } else {
        if (listView) listView.style.display = "none";
        if (groupedView) groupedView.style.display = "block";
        renderAtletiGrouped(filtered);
    }
}

function renderAtletiList(data) {
    const tbody = document.getElementById("allAtletiBody");
    const emptyState = document.getElementById("emptyAllAtletiState");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (data.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }
    if (emptyState) emptyState.style.display = "none";

    data.forEach(a => {
        const tr = document.createElement("tr");

        const istruttoreBadge = a.istruttore_nome && a.istruttore_nome !== "Non assegnato"
            ? `<span class="badge badge-istruttore">${a.istruttore_nome}</span>`
            : `<span class="badge" style="background:#333; color:#aaa;">Nessun istruttore</span>`;

        const contattoTel = [a.cellulare, a.telefono].filter(Boolean).join(" / ") || "-";

        tr.innerHTML = `
            <td>${a.IDatleta}</td>
            <td><strong>${a.nome} ${a.cognome}</strong></td>
            <td><span style="font-family: monospace; font-size: 0.8rem; color: #cbd5e1;">${a.codice_fiscale || "-"}</span></td>
            <td>${a.email || "-"}</td>
            <td>${contattoTel}</td>
            <td>${a.citta || "-"}</td>
            <td>${istruttoreBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAtletiGrouped(data) {
    const container = document.getElementById("atletiGroupsContainer");
    const emptyState = document.getElementById("emptyGroupedAtletiState");
    if (!container) return;

    container.innerHTML = "";
    if (data.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }
    if (emptyState) emptyState.style.display = "none";

    const groups = {};
    data.forEach(a => {
        const key = a.IDistruttore ? String(a.IDistruttore) : "unassigned";
        if (!groups[key]) {
            groups[key] = {
                id: a.IDistruttore,
                nome: a.istruttore_nome || "Atleti non assegnati",
                email: a.istruttore_email || "",
                atleti: []
            };
        }
        groups[key].atleti.push(a);
    });

    // Se non ci sono filtri restrittivi, mostra anche gli altri istruttori con 0 atleti
    const idIstruttoreFilter = document.getElementById("filterIstruttoreAtleti")?.value || "";
    const q = (document.getElementById("searchAtletiInput")?.value || "").trim();
    if (!q && !idIstruttoreFilter) {
        istruttori.forEach(istr => {
            const key = String(istr.IDistruttore);
            if (!groups[key]) {
                groups[key] = {
                    id: istr.IDistruttore,
                    nome: `${istr.Nome} ${istr.Cognome}`,
                    email: istr["E-mail"] || "",
                    atleti: []
                };
            }
        });
    }

    Object.values(groups).forEach(g => {
        const groupCard = document.createElement("div");
        groupCard.className = "group-card";
        if (!g.id) {
            groupCard.style.borderLeftColor = "#64748b";
        }

        let tableContent = "";
        if (g.atleti.length === 0) {
            tableContent = `<div style="padding: 16px; color: #777; font-size: 0.85rem; font-style: italic;">Nessun atleta attualmente assegnato a questo istruttore.</div>`;
        } else {
            tableContent = `
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Cognome</th>
                        <th>Codice Fiscale</th>
                        <th>Email</th>
                        <th>Telefono / Cellulare</th>
                        <th>Città</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${g.atleti.map(a => `
                        <tr>
                          <td>${a.IDatleta}</td>
                          <td><strong>${a.nome}</strong></td>
                          <td><strong>${a.cognome}</strong></td>
                          <td><span style="font-family: monospace; font-size: 0.8rem; color: #cbd5e1;">${a.codice_fiscale || "-"}</span></td>
                          <td>${a.email || "-"}</td>
                          <td>${[a.cellulare, a.telefono].filter(Boolean).join(" / ") || "-"}</td>
                          <td>${a.citta || "-"}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
            `;
        }

        groupCard.innerHTML = `
            <div class="group-header">
              <div class="group-title">
                <span>${g.nome}</span>
                ${g.email ? `<small style="font-weight: normal; color: #888; font-size: 0.8rem;">(${g.email})</small>` : ""}
              </div>
              <div class="group-count">${g.atleti.length} ${g.atleti.length === 1 ? "atleta seguito" : "atleti seguiti"}</div>
            </div>
            ${tableContent}
        `;
        container.appendChild(groupCard);
    });
}

