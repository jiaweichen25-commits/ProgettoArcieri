const API_URL = "http://localhost:8000";

let istruttori = [];

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadIstruttori();
});

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

// CARICAMENTO ISTRUTTORI
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
    } catch (err) {
        console.error(err);
    }
}

function renderTable(data) {
    const tbody = document.getElementById("istruttoriBody");
    const emptyState = document.getElementById("emptyState");
    document.getElementById("cntIstruttori").textContent = data.length;

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
                ? `<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 5px;">Sospeso</span>`
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
    const qualifica = document.getElementById("addQualifica").value.trim();

    if (!nome || !cognome || !email) {
        showMsg("addMsgBox", "Compila nome, cognome ed email", "error");
        return;
    }

    const payload = { nome, cognome, email, qualifica };
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
        loadIstruttori();
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
        loadIstruttori();
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
        loadIstruttori();
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
        loadIstruttori();
    } catch (err) {
        showMsg("suspendMsgBox", err.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Applica";
    }
}
