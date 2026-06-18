const API_URL = "http://localhost:8000";

function authHeaders() {
    const token = localStorage.getItem("access_token");
    return token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };
}

// Array di oggetti {id, valore} — popolati dall'API
let exerciseDatabase   = [];
let tempiDatabase      = [];
let ripetizioniDatabase = [];

// Elementi DOM - Modale Esercizi
const exerciseSelect     = document.getElementById('exercise-select');
const tableBody          = document.getElementById('table-body');
const modalEsercizi      = document.getElementById('exercise-modal');
const openModalBtn       = document.getElementById('open-modal-btn');
const closeModalEsercizi = document.querySelector('#exercise-modal .close-modal');
const modalExercisesList = document.getElementById('modal-exercises-list');
const newExerciseInput   = document.getElementById('new-exercise-input');
const addExerciseBtn     = document.getElementById('add-exercise-btn');

// Elementi DOM - Modale Ripetizioni
const ripetizioniSelect       = document.getElementById('ripetizioni-select');
const modalRipetizioni        = document.getElementById('ripetizioni-modal');
const openRipetizioniModalBtn = document.getElementById('open-ripetizioni-modal-btn');
const closeModalRipetizioni   = document.querySelector('#ripetizioni-modal .close-modal');
const modalRipetizioniList    = document.getElementById('modal-ripetizioni-list');
const newRipetizioneInput     = document.getElementById('new-ripetizione-input');
const addRipetizioneBtn       = document.getElementById('add-ripetizione-btn');

// Elementi DOM - Modale Tempi
const modalTempi        = document.getElementById('tempi-modal');
const openTempiModalBtn = document.getElementById('open-tempi-modal-btn');
const closeModalTempi   = document.querySelector('#tempi-modal .close-modal');
const modalTempiList    = document.getElementById('modal-tempi-list');
const newTempoInput     = document.getElementById('new-tempo-input');
const addTempoBtn       = document.getElementById('add-tempo-btn');

// ─── CARICA LOOKUP DA API ──────────────────────────────────────

async function caricaLookup() {
    try {
        const [exRes, tempiRes, ripRes] = await Promise.all([
            fetch(`${API_URL}/allenamenti/lookup/tfr/exercises/`),
            fetch(`${API_URL}/allenamenti/lookup/tfr/tempi/`),
            fetch(`${API_URL}/allenamenti/lookup/tfr/ripetizioni/`),
        ]);
        exerciseDatabase    = await exRes.json();
        tempiDatabase       = await tempiRes.json();
        ripetizioniDatabase = await ripRes.json();
    } catch (e) {
        console.error("Errore caricamento lookup:", e);
    }
    updateDropdown();
    updateRipetizioniDropdown();
}

// ─── ESERCIZI ─────────────────────────────────────────────────

function updateDropdown() {
    const currentValue = exerciseSelect.value;
    exerciseSelect.innerHTML = '<option value="" disabled selected>Seleziona un esercizio...</option>';
    exerciseDatabase.forEach(item => {
        const option = document.createElement('option');
        option.value = item.valore;
        option.textContent = item.valore;
        exerciseSelect.appendChild(option);
    });
    if (exerciseDatabase.some(e => e.valore === currentValue)) {
        exerciseSelect.value = currentValue;
    }
}

function renderModalEsercizi() {
    modalExercisesList.innerHTML = '';
    exerciseDatabase.forEach(item => {
        const row = document.createElement('div');
        row.className = 'modal-exercise-row';
        row.innerHTML = `
            <input type="text" value="${item.valore}" readonly class="modal-item-input">
            <button class="delete-btn" data-id="${item.id}">×</button>
        `;
        row.querySelector('.delete-btn').addEventListener('click', () => eliminaEsercizio(item.id));
        modalExercisesList.appendChild(row);
    });
}

exerciseSelect.addEventListener('change', (e) => {
    const selectedExercise = e.target.value;
    if (!selectedExercise) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="table-select main-row-select">
                ${exerciseDatabase.map(ex => `<option value="${ex.valore}" ${ex.valore === selectedExercise ? 'selected' : ''}>${ex.valore}</option>`).join('')}
            </select>
        </td>
        ${Array(6).fill().map(() => `
            <td>
                <select class="table-select serie-row-select">
                    <option value="-">-</option>
                    <option value="10">10</option>
                    <option value="12">12</option>
                    <option value="15">15</option>
                </select>
            </td>`).join('')}
        <td>
            <select class="table-select tempi-row-select">
                <option value="-">-</option>
                ${tempiDatabase.map(t => `<option value="${t.valore}">${t.valore}</option>`).join('')}
            </select>
        </td>
        <td>
            <select class="table-select ripetizioni-row-select">
                <option value="">-</option>
                ${ripetizioniDatabase.map(r => `<option value="${r.valore}">${r.valore}</option>`).join('')}
            </select>
        </td>
        <td style="text-align:center;">
            <button class="delete-btn remove-row-btn">×</button>
        </td>
    `;

    tableBody.appendChild(row);
    exerciseSelect.value = "";
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
});

addExerciseBtn.addEventListener('click', async () => {
    const value = newExerciseInput.value.trim();
    if (!value) return;
    try {
        const res = await fetch(`${API_URL}/allenamenti/lookup/tfr/exercises/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ valore: value }),
        });
        if (!res.ok) return;
        const newItem = await res.json();
        exerciseDatabase.push(newItem);
        newExerciseInput.value = "";
        renderModalEsercizi();
        updateDropdown();
        refreshMainTableSelects();
    } catch (e) { console.error(e); }
});

async function eliminaEsercizio(id) {
    try {
        await fetch(`${API_URL}/allenamenti/lookup/tfr/exercises/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    } catch (e) { console.error(e); }
    exerciseDatabase = exerciseDatabase.filter(e => e.id !== id);
    renderModalEsercizi();
    updateDropdown();
    refreshMainTableSelects();
}

function refreshMainTableSelects() {
    document.querySelectorAll('.main-row-select').forEach(select => {
        const savedVal = select.value;
        select.innerHTML = exerciseDatabase.map(ex => `<option value="${ex.valore}" ${ex.valore === savedVal ? 'selected' : ''}>${ex.valore}</option>`).join('');
    });
}

// ─── RIPETIZIONI ──────────────────────────────────────────────

function updateRipetizioniDropdown() {
    const currentValue = ripetizioniSelect.value;
    ripetizioniSelect.innerHTML = '<option value="" disabled selected>Seleziona...</option>';
    ripetizioniDatabase.forEach(item => {
        const option = document.createElement('option');
        option.value = item.valore;
        option.textContent = item.valore;
        ripetizioniSelect.appendChild(option);
    });
    if (ripetizioniDatabase.some(r => r.valore === currentValue)) {
        ripetizioniSelect.value = currentValue;
    }
}

function renderModalRipetizioni() {
    modalRipetizioniList.innerHTML = '';
    ripetizioniDatabase.forEach(item => {
        const row = document.createElement('div');
        row.className = 'modal-exercise-row';
        row.innerHTML = `
            <input type="text" value="${item.valore}" readonly class="modal-ripetizione-input">
            <button class="delete-btn" data-id="${item.id}">×</button>
        `;
        row.querySelector('.delete-btn').addEventListener('click', () => eliminaRipetizione(item.id));
        modalRipetizioniList.appendChild(row);
    });
}

addRipetizioneBtn.addEventListener('click', async () => {
    const value = newRipetizioneInput.value.trim();
    if (!value) return;
    try {
        const res = await fetch(`${API_URL}/allenamenti/lookup/tfr/ripetizioni/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ valore: value }),
        });
        if (!res.ok) return;
        const newItem = await res.json();
        ripetizioniDatabase.push(newItem);
        newRipetizioneInput.value = "";
        renderModalRipetizioni();
        updateRipetizioniDropdown();
        refreshRipetizioniSelects();
    } catch (e) { console.error(e); }
});

async function eliminaRipetizione(id) {
    try {
        await fetch(`${API_URL}/allenamenti/lookup/tfr/ripetizioni/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    } catch (e) { console.error(e); }
    ripetizioniDatabase = ripetizioniDatabase.filter(r => r.id !== id);
    renderModalRipetizioni();
    updateRipetizioniDropdown();
    refreshRipetizioniSelects();
}

function refreshRipetizioniSelects() {
    document.querySelectorAll('.ripetizioni-row-select').forEach(select => {
        const savedVal = select.value;
        select.innerHTML = `<option value="">-</option>` +
            ripetizioniDatabase.map(r => `<option value="${r.valore}" ${r.valore === savedVal ? 'selected' : ''}>${r.valore}</option>`).join('');
    });
}

openRipetizioniModalBtn.addEventListener('click', () => {
    renderModalRipetizioni();
    modalRipetizioni.style.display = 'block';
});
closeModalRipetizioni.addEventListener('click', () => {
    modalRipetizioni.style.display = 'none';
});

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
        const res = await fetch(`${API_URL}/allenamenti/lookup/tfr/tempi/`, {
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
        await fetch(`${API_URL}/allenamenti/lookup/tfr/tempi/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    } catch (e) { console.error(e); }
    tempiDatabase = tempiDatabase.filter(t => t.id !== id);
    renderModalTempi();
    refreshTempiSelects();
}

function refreshTempiSelects() {
    document.querySelectorAll('.tempi-row-select').forEach(select => {
        const savedVal = select.value;
        select.innerHTML = `<option value="-">-</option>` +
            tempiDatabase.map(t => `<option value="${t.valore}" ${t.valore === savedVal ? 'selected' : ''}>${t.valore}</option>`).join('');
    });
}

// ─── GESTIONE MODALI ──────────────────────────────────────────

openModalBtn.addEventListener('click', () => {
    renderModalEsercizi();
    modalEsercizi.style.display = 'block';
});
closeModalEsercizi.addEventListener('click', () => {
    modalEsercizi.style.display = 'none';
});

openTempiModalBtn.addEventListener('click', () => {
    renderModalTempi();
    modalTempi.style.display = 'block';
});
closeModalTempi.addEventListener('click', () => {
    modalTempi.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modalEsercizi)    modalEsercizi.style.display = 'none';
    if (e.target === modalTempi)       modalTempi.style.display = 'none';
    if (e.target === modalRipetizioni) modalRipetizioni.style.display = 'none';
});

// ─── INIZIALIZZAZIONE ─────────────────────────────────────────
caricaLookup();
