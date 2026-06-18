const API_URL = "http://localhost:8000";

function authHeaders() {
    const token = localStorage.getItem("access_token");
    return token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };
}

// Array di oggetti {id, valore} — popolati dall'API
let atrezzoDatabase    = [];
let tempiDatabase      = [];
let descrizioneDatabase = [];

// Elementi DOM - Modale Atrezzi
const atrezzoSelect       = document.getElementById('atrezzo-select');
const tableBody           = document.getElementById('table-body');
const modalAtrezzo        = document.getElementById('atrezzo-modal');
const openAtrezzoModalBtn = document.getElementById('open-atrezzo-modal-btn');
const closeModalAtrezzo   = document.querySelector('#atrezzo-modal .close-modal');
const modalAtrezzoList    = document.getElementById('modal-atrezzo-list');
const newAtrezzoInput     = document.getElementById('new-atrezzo-input');
const addAtrezzoBtn       = document.getElementById('add-atrezzo-btn');

// Elementi DOM - Modale Tempi
const modalTempi        = document.getElementById('tempi-modal');
const openTempiModalBtn = document.getElementById('open-tempi-modal-btn');
const closeModalTempi   = document.querySelector('#tempi-modal .close-modal');
const modalTempiList    = document.getElementById('modal-tempi-list');
const newTempoInput     = document.getElementById('new-tempo-input');
const addTempoBtn       = document.getElementById('add-tempo-btn');

// Elementi DOM - Modale Descrizione
const descrizioneSelect       = document.getElementById('descrizione-select');
const modalDescrizione        = document.getElementById('descrizione-modal');
const openDescrizioneModalBtn = document.getElementById('open-descrizione-modal-btn');
const closeModalDescrizione   = document.querySelector('#descrizione-modal .close-modal');
const modalDescrizioneList    = document.getElementById('modal-descrizione-list');
const newDescrizioneInput     = document.getElementById('new-descrizione-input');
const addDescrizioneBtn       = document.getElementById('add-descrizione-btn');

// ─── CARICA LOOKUP DA API ──────────────────────────────────────

async function caricaLookup() {
    try {
        const [atRes, tempiRes, descRes] = await Promise.all([
            fetch(`${API_URL}/allenamenti/lookup/fc/atrezzi/`),
            fetch(`${API_URL}/allenamenti/lookup/fc/tempi/`),
            fetch(`${API_URL}/allenamenti/lookup/fc/descrizione/`),
        ]);
        atrezzoDatabase     = await atRes.json();
        tempiDatabase       = await tempiRes.json();
        descrizioneDatabase = await descRes.json();
    } catch (e) {
        console.error("Errore caricamento lookup:", e);
    }
    updateAtrezzoDropdown();
    updateDescrizioneDropdown();
}

// ─── ATREZZI ──────────────────────────────────────────────────

function updateAtrezzoDropdown() {
    const currentValue = atrezzoSelect.value;
    atrezzoSelect.innerHTML = '<option value="" disabled selected>Seleziona un atrezzo...</option>';
    atrezzoDatabase.forEach(item => {
        const option = document.createElement('option');
        option.value = item.valore;
        option.textContent = item.valore;
        atrezzoSelect.appendChild(option);
    });
    if (atrezzoDatabase.some(a => a.valore === currentValue)) {
        atrezzoSelect.value = currentValue;
    }
}

function renderModalAtrezzo() {
    modalAtrezzoList.innerHTML = '';
    atrezzoDatabase.forEach(item => {
        const row = document.createElement('div');
        row.className = 'modal-exercise-row';
        row.innerHTML = `
            <input type="text" value="${item.valore}" readonly class="modal-atrezzo-input">
            <button class="delete-btn" data-id="${item.id}">×</button>
        `;
        row.querySelector('.delete-btn').addEventListener('click', () => eliminaAtrezzo(item.id));
        modalAtrezzoList.appendChild(row);
    });
}

atrezzoSelect.addEventListener('change', (e) => {
    const selectedAtrezzo = e.target.value;
    if (!selectedAtrezzo) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="table-select atrezzo-row-select">
                ${atrezzoDatabase.map(a => `<option value="${a.valore}" ${a.valore === selectedAtrezzo ? 'selected' : ''}>${a.valore}</option>`).join('')}
            </select>
        </td>
        ${Array(6).fill().map(() => `
            <td>
                <select class="table-select tempi-row-select">
                    <option value="-">-</option>
                    ${tempiDatabase.map(t => `<option value="${t.valore}">${t.valore}</option>`).join('')}
                </select>
            </td>`).join('')}
        <td>
            <select class="table-select tempi-popup-row-select">
                <option value="-">-</option>
                ${tempiDatabase.map(t => `<option value="${t.valore}">${t.valore}</option>`).join('')}
            </select>
        </td>
        <td>
            <select class="table-select descrizione-row-select">
                <option value="">-</option>
                ${descrizioneDatabase.map(d => `<option value="${d.valore}">${d.valore}</option>`).join('')}
            </select>
        </td>
        <td style="text-align:center;">
            <button class="delete-btn remove-row-btn">×</button>
        </td>
    `;

    tableBody.appendChild(row);
    atrezzoSelect.value = "";
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
});

addAtrezzoBtn.addEventListener('click', async () => {
    const value = newAtrezzoInput.value.trim();
    if (!value) return;
    try {
        const res = await fetch(`${API_URL}/allenamenti/lookup/fc/atrezzi/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ valore: value }),
        });
        if (!res.ok) return;
        const newItem = await res.json();
        atrezzoDatabase.push(newItem);
        newAtrezzoInput.value = "";
        renderModalAtrezzo();
        updateAtrezzoDropdown();
        refreshAtrezzoSelects();
    } catch (e) { console.error(e); }
});

async function eliminaAtrezzo(id) {
    try {
        await fetch(`${API_URL}/allenamenti/lookup/fc/atrezzi/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    } catch (e) { console.error(e); }
    atrezzoDatabase = atrezzoDatabase.filter(a => a.id !== id);
    renderModalAtrezzo();
    updateAtrezzoDropdown();
    refreshAtrezzoSelects();
}

function refreshAtrezzoSelects() {
    document.querySelectorAll('.atrezzo-row-select').forEach(select => {
        const savedVal = select.value;
        select.innerHTML = atrezzoDatabase.map(a => `<option value="${a.valore}" ${a.valore === savedVal ? 'selected' : ''}>${a.valore}</option>`).join('');
    });
}

// ─── TEMPI ────────────────────────────────────────────────────

function renderModalTempi() {
    modalTempiList.innerHTML = '';
    tempiDatabase.forEach(item => {
        const row = document.createElement('div');
        row.className = 'modal-exercise-row';
        row.innerHTML = `
            <input type="text" value="${item.valore}" readonly class="modal-tempo-input">
            <button class="delete-btn" data-id="${item.id}">×</button>
        `;
        row.querySelector('.delete-btn').addEventListener('click', () => eliminaTempo(item.id));
        modalTempiList.appendChild(row);
    });
}

addTempoBtn.addEventListener('click', async () => {
    const value = newTempoInput.value.trim();
    if (!value) return;
    try {
        const res = await fetch(`${API_URL}/allenamenti/lookup/fc/tempi/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ valore: value }),
        });
        if (!res.ok) return;
        const newItem = await res.json();
        tempiDatabase.push(newItem);
        newTempoInput.value = "";
        renderModalTempi();
        refreshTempiSelects();
    } catch (e) { console.error(e); }
});

async function eliminaTempo(id) {
    try {
        await fetch(`${API_URL}/allenamenti/lookup/fc/tempi/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    } catch (e) { console.error(e); }
    tempiDatabase = tempiDatabase.filter(t => t.id !== id);
    renderModalTempi();
    refreshTempiSelects();
}

function refreshTempiSelects() {
    document.querySelectorAll('.tempi-row-select, .tempi-popup-row-select').forEach(select => {
        const savedVal = select.value;
        select.innerHTML = `<option value="-">-</option>` +
            tempiDatabase.map(t => `<option value="${t.valore}" ${t.valore === savedVal ? 'selected' : ''}>${t.valore}</option>`).join('');
    });
}

// ─── DESCRIZIONE ──────────────────────────────────────────────

function updateDescrizioneDropdown() {
    const currentValue = descrizioneSelect.value;
    descrizioneSelect.innerHTML = '<option value="" disabled selected>Seleziona...</option>';
    descrizioneDatabase.forEach(item => {
        const option = document.createElement('option');
        option.value = item.valore;
        option.textContent = item.valore;
        descrizioneSelect.appendChild(option);
    });
    if (descrizioneDatabase.some(d => d.valore === currentValue)) {
        descrizioneSelect.value = currentValue;
    }
}

function renderModalDescrizione() {
    modalDescrizioneList.innerHTML = '';
    descrizioneDatabase.forEach(item => {
        const row = document.createElement('div');
        row.className = 'modal-exercise-row';
        row.innerHTML = `
            <input type="text" value="${item.valore}" readonly class="modal-descrizione-input">
            <button class="delete-btn" data-id="${item.id}">×</button>
        `;
        row.querySelector('.delete-btn').addEventListener('click', () => eliminaDescrizione(item.id));
        modalDescrizioneList.appendChild(row);
    });
}

addDescrizioneBtn.addEventListener('click', async () => {
    const value = newDescrizioneInput.value.trim();
    if (!value) return;
    try {
        const res = await fetch(`${API_URL}/allenamenti/lookup/fc/descrizione/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ valore: value }),
        });
        if (!res.ok) return;
        const newItem = await res.json();
        descrizioneDatabase.push(newItem);
        newDescrizioneInput.value = "";
        renderModalDescrizione();
        updateDescrizioneDropdown();
        refreshDescrizioneSelects();
    } catch (e) { console.error(e); }
});

async function eliminaDescrizione(id) {
    try {
        await fetch(`${API_URL}/allenamenti/lookup/fc/descrizione/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    } catch (e) { console.error(e); }
    descrizioneDatabase = descrizioneDatabase.filter(d => d.id !== id);
    renderModalDescrizione();
    updateDescrizioneDropdown();
    refreshDescrizioneSelects();
}

function refreshDescrizioneSelects() {
    document.querySelectorAll('.descrizione-row-select').forEach(select => {
        const savedVal = select.value;
        select.innerHTML = `<option value="">-</option>` +
            descrizioneDatabase.map(d => `<option value="${d.valore}" ${d.valore === savedVal ? 'selected' : ''}>${d.valore}</option>`).join('');
    });
}

// ─── GESTIONE MODALI ──────────────────────────────────────────

openAtrezzoModalBtn.addEventListener('click', () => {
    renderModalAtrezzo();
    modalAtrezzo.style.display = 'block';
});
closeModalAtrezzo.addEventListener('click', () => {
    modalAtrezzo.style.display = 'none';
});

openTempiModalBtn.addEventListener('click', () => {
    renderModalTempi();
    modalTempi.style.display = 'block';
});
closeModalTempi.addEventListener('click', () => {
    modalTempi.style.display = 'none';
});

openDescrizioneModalBtn.addEventListener('click', () => {
    renderModalDescrizione();
    modalDescrizione.style.display = 'block';
});
closeModalDescrizione.addEventListener('click', () => {
    modalDescrizione.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modalAtrezzo)     modalAtrezzo.style.display = 'none';
    if (e.target === modalTempi)       modalTempi.style.display = 'none';
    if (e.target === modalDescrizione) modalDescrizione.style.display = 'none';
});

// ─── INIZIALIZZAZIONE ─────────────────────────────────────────
caricaLookup();
