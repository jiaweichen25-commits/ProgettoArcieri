// Riferimenti agli elementi DOM
const modal            = document.getElementById('exerciseModal');
const openBtn          = document.getElementById('openPopupBtn');
const closeBtn         = document.getElementById('closePopupBtn');
const popupTableBody   = document.querySelector('#popupTable tbody');
const inputNewExercise = document.getElementById('inputNewExercise');
const rowAddNew        = document.getElementById('rowAddNew');
const mainList         = document.getElementById('mainExerciseList');
const dropdownBtn      = document.getElementById('dropdownBtn');
const dropdownList     = document.getElementById('dropdownList');
const dynamicColumnsContainer = document.getElementById('dynamicColumnsContainer');

// Apre e chiude il pop-up
openBtn.addEventListener('click', () => modal.style.display = 'flex');
closeBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

// Aggiorna la lista principale nella pagina in base al pop-up
function updateMainList() {
    mainList.innerHTML = '';
    const inputs = popupTableBody.querySelectorAll('tr:not(#rowAddNew) input[type="text"]');
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            const div = document.createElement('div');
            div.className = 'list-item';
            if (input.value.toLowerCase().includes('esercizio')) {
                div.classList.add('text-muted');
            }
            div.textContent = input.value;
            mainList.appendChild(div);
        }
    });
}

// Aggiorna la lista dropdown
function updateDropdownList() {
    dropdownList.innerHTML = '';
    const inputs = popupTableBody.querySelectorAll('tr:not(#rowAddNew) input[type="text"]');
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            // Divide per virgola se ci sono più esercizi nella stessa riga
            const exercises = input.value.split(',').map(e => e.trim());
            exercises.forEach(exercise => {
                // Rimuove il testo tra parentesi (es. "vedi Tabella Esercizi")
                const cleanExercise = exercise.replace(/\s*\(.*?\)\s*/g, '').trim();
                if (cleanExercise !== '') {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.textContent = cleanExercise;
                    item.addEventListener('click', () => addDynamicColumn(cleanExercise));
                    dropdownList.appendChild(item);
                }
            });
        }
    });
}

// Apertura/chiusura dropdown
dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownList.style.display = dropdownList.style.display === 'none' ? 'block' : 'none';
});

window.addEventListener('click', (e) => {
    if (e.target !== dropdownBtn && !dropdownList.contains(e.target)) {
        dropdownList.style.display = 'none';
    }
});

// Aggiunge una colonna dinamica
function addDynamicColumn(exerciseName) {
    // Controlla se la colonna esiste già
    const existingColumns = dynamicColumnsContainer.querySelectorAll('.dynamic-column');
    for (let col of existingColumns) {
        if (col.textContent.includes(exerciseName)) {
            alert('Questo esercizio è già stato aggiunto!');
            return;
        }
    }

    const columnDiv = document.createElement('div');
    columnDiv.className = 'dynamic-column';
    columnDiv.innerHTML = `
        <span class="dynamic-column-name">${exerciseName}</span>
        <button class="dynamic-column-close">×</button>
    `;
    columnDiv.querySelector('.dynamic-column-close').addEventListener('click', () => {
        columnDiv.remove();
    });

    dynamicColumnsContainer.appendChild(columnDiv);
    dropdownList.style.display = 'none';
}

// Gestione del click di eliminazione nella tabella
popupTableBody.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-delete')) {
        e.target.closest('tr').remove();
        updateMainList();
        updateDropdownList();
    }
});

// Aggiunta di un nuovo esercizio con "Invio"
inputNewExercise.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" value="${this.value}"></td>
            <td class="col-azione"><button class="btn-delete">×</button></td>
        `;
        popupTableBody.insertBefore(newRow, rowAddNew);
        this.value = '';
        updateMainList();
        updateDropdownList();
    }
});

// Aggiorna la lista se viene modificato il testo direttamente dagli input
popupTableBody.addEventListener('input', function(e) {
    if (e.target.id !== 'inputNewExercise') {
        updateMainList();
        updateDropdownList();
    }
});

// Calcola il totale delle frecce
function calculateTotalFrecce() {
    const inputs = document.querySelectorAll('#freccePerGiorno .frecce-input');
    let total = 0;
    inputs.forEach(input => { total += parseInt(input.value) || 0; });
    document.getElementById('totalFrecceTotale').textContent = total;
}

// Event listener per gli input delle frecce
document.querySelectorAll('#freccePerGiorno .frecce-input').forEach(input => {
    input.addEventListener('input', calculateTotalFrecce);
});

// Inizializza la lista dropdown
updateDropdownList();
