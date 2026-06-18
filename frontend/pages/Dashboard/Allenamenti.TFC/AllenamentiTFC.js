const API_URL = "http://localhost:8000";

function authHeaders() {
    const token = localStorage.getItem("access_token");
    return token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };
}

const tableBody = document.querySelector('#dynamicTechTable tbody');

// Array di oggetti {id, valore} — popolati dall'API
let vleratPiedi      = [];
let vleratDistanza   = [];
let vleratSerie      = [];
let vleratTarga      = [];
let vleratDescrizione = [];

// Mappa indice input → ID modale
const modalMap = [
    'piediModal',      // 0
    'distanzaModal',   // 1
    'targaModal',      // 2
    'serieModal',      // 3-8
    'serieModal',
    'serieModal',
    'serieModal',
    'serieModal',
    'serieModal',
    'serieModal',      // 9
    'descrizioneModal' // 10
];

let activeCellTecnica = null;

// ─── CARICA LOOKUP DA API ──────────────────────────────────────

async function caricaLookup() {
    try {
        const [piediRes, distRes, targaRes, serieRes, descRes] = await Promise.all([
            fetch(`${API_URL}/allenamenti/lookup/tfc/piedi/`),
            fetch(`${API_URL}/allenamenti/lookup/tfc/distanza/`),
            fetch(`${API_URL}/allenamenti/lookup/tfc/targa/`),
            fetch(`${API_URL}/allenamenti/lookup/tfc/serie/`),
            fetch(`${API_URL}/allenamenti/lookup/tfc/descrizione/`),
        ]);
        vleratPiedi       = await piediRes.json();
        vleratDistanza    = await distRes.json();
        vleratTarga       = await targaRes.json();
        vleratSerie       = await serieRes.json();
        vleratDescrizione = await descRes.json();
    } catch (e) {
        console.error("Errore caricamento lookup:", e);
    }
    addEmptyRow();
}

// ─── GESTIONE MODALI ──────────────────────────────────────────

function closeAllModals() {
    ['piediModal','distanzaModal','targaModal','serieModal','descrizioneModal'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}

function renderModalList(listId, dataArray, lookupType) {
    const list = document.getElementById(listId);
    list.innerHTML = '';

    dataArray.forEach(item => {
        const row = document.createElement('div');
        row.className = 'modal-exercise-row';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.valore;
        input.readOnly = true;

        input.addEventListener('click', () => {
            if (activeCellTecnica) {
                activeCellTecnica.value = item.valore;
                const deleteBtn = activeCellTecnica.closest('tr').querySelector('.btn-row-delete');
                if (deleteBtn) deleteBtn.style.display = 'flex';
                addEmptyRow();
            }
            closeAllModals();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await eliminaLookupItem(lookupType, item.id, dataArray, listId);
        });

        row.appendChild(input);
        row.appendChild(deleteBtn);
        list.appendChild(row);
    });
}

async function eliminaLookupItem(lookupType, id, dataArray, listId) {
    try {
        await fetch(`${API_URL}/allenamenti/lookup/tfc/${lookupType}/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    } catch (e) { console.error(e); }
    const idx = dataArray.findIndex(i => i.id === id);
    if (idx !== -1) dataArray.splice(idx, 1);
    renderModalList(listId, dataArray, lookupType);
}

// ─── RIGHE TABELLA ────────────────────────────────────────────

function addEmptyRow() {
    const tr = document.createElement('tr');
    const cells = Array(11).fill(null).map(() =>
        `<td><div class="cell-wrapper"><input type="text" readonly><span class="inside-arrow">▼</span></div></td>`
    ).join('');
    tr.innerHTML = cells + `<td><button class="btn-row-delete" style="display:none;">×</button></td>`;

    const inputs = tr.querySelectorAll('input[type="text"]');
    inputs.forEach((input, index) => {
        input.addEventListener('click', function () {
            activeCellTecnica = this;
            openModalForCell(modalMap[index]);
        });
    });

    tr.querySelector('.btn-row-delete').addEventListener('click', function () {
        tr.remove();
        if (tableBody.querySelectorAll('tr').length === 0) addEmptyRow();
    });

    tableBody.appendChild(tr);
}

// ─── PULSANTI AGGIUNGI NEI MODALI ─────────────────────────────

async function aggiungiLookupItem(lookupType, inputId, dataArray, listId) {
    const value = document.getElementById(inputId).value.trim();
    if (!value) return;
    try {
        const res = await fetch(`${API_URL}/allenamenti/lookup/tfc/${lookupType}/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ valore: value }),
        });
        if (!res.ok) return;
        const newItem = await res.json();
        dataArray.push(newItem);
        document.getElementById(inputId).value = '';
        renderModalList(listId, dataArray, lookupType);
    } catch (e) { console.error(e); }
}

document.getElementById('add-piedi-btn').addEventListener('click', () =>
    aggiungiLookupItem('piedi', 'new-piedi-input', vleratPiedi, 'modal-piedi-list'));

document.getElementById('add-distanza-btn').addEventListener('click', () =>
    aggiungiLookupItem('distanza', 'new-distanza-input', vleratDistanza, 'modal-distanza-list'));

document.getElementById('add-targa-btn').addEventListener('click', () =>
    aggiungiLookupItem('targa', 'new-targa-input', vleratTarga, 'modal-targa-list'));

document.getElementById('add-serie-btn').addEventListener('click', () =>
    aggiungiLookupItem('serie', 'new-serie-input', vleratSerie, 'modal-serie-list'));

document.getElementById('add-descrizione-btn').addEventListener('click', () =>
    aggiungiLookupItem('descrizione', 'new-descrizione-input', vleratDescrizione, 'modal-descrizione-list'));

// ─── APERTURA MODALI DAI PULSANTI HEADER ──────────────────────

const modalListMap = {
    piediModal:       { listId: 'modal-piedi-list',       data: () => vleratPiedi,       type: 'piedi' },
    distanzaModal:    { listId: 'modal-distanza-list',    data: () => vleratDistanza,    type: 'distanza' },
    targaModal:       { listId: 'modal-targa-list',       data: () => vleratTarga,       type: 'targa' },
    serieModal:       { listId: 'modal-serie-list',       data: () => vleratSerie,       type: 'serie' },
    descrizioneModal: { listId: 'modal-descrizione-list', data: () => vleratDescrizione, type: 'descrizione' },
};

function openModalForCell(modalId) {
    const cfg = modalListMap[modalId];
    if (cfg) renderModalList(cfg.listId, cfg.data(), cfg.type);
    document.getElementById(modalId).style.display = 'block';
}

document.getElementById('piediPopBtn').addEventListener('click', () => {
    activeCellTecnica = null;
    renderModalList('modal-piedi-list', vleratPiedi, 'piedi');
    document.getElementById('piediModal').style.display = 'block';
});
document.getElementById('distanzaPopBtn').addEventListener('click', () => {
    activeCellTecnica = null;
    renderModalList('modal-distanza-list', vleratDistanza, 'distanza');
    document.getElementById('distanzaModal').style.display = 'block';
});
document.getElementById('targaPopTrigger').addEventListener('click', () => {
    activeCellTecnica = null;
    renderModalList('modal-targa-list', vleratTarga, 'targa');
    document.getElementById('targaModal').style.display = 'block';
});
document.getElementById('seriePopBtn').addEventListener('click', () => {
    activeCellTecnica = null;
    renderModalList('modal-serie-list', vleratSerie, 'serie');
    document.getElementById('serieModal').style.display = 'block';
});
document.getElementById('descrizionePopBtn').addEventListener('click', () => {
    activeCellTecnica = null;
    renderModalList('modal-descrizione-list', vleratDescrizione, 'descrizione');
    document.getElementById('descrizioneModal').style.display = 'block';
});

// ─── CHIUSURA MODALI ──────────────────────────────────────────

document.getElementById('closePiediBtn').addEventListener('click', closeAllModals);
document.getElementById('closeDistanzaBtn').addEventListener('click', closeAllModals);
document.getElementById('closeTargaBtn').addEventListener('click', closeAllModals);
document.getElementById('closeSerieBtn').addEventListener('click', closeAllModals);
document.getElementById('closeDescrizioneBtn').addEventListener('click', closeAllModals);

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) closeAllModals();
});

// ─── INIZIALIZZAZIONE ─────────────────────────────────────────
caricaLookup();
