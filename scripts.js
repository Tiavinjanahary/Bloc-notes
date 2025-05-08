function mettreAJourHorloge() {
    var maintenant = new Date();
    var heures = String(maintenant.getHours()).padStart(2, '0');
    var minutes = String(maintenant.getMinutes()).padStart(2, '0');
    var secondes = String(maintenant.getSeconds()).padStart(2, '0');
    var jour = String(maintenant.getDate()).padStart(2, '0');
    var mois = String(maintenant.getMonth() + 1).padStart(2, '0');
    var annee = maintenant.getFullYear();

    var dateHeure = jour + '/' + mois + '/' + annee + ' - ' + heures + ':' + minutes + ':' + secondes;
    document.getElementById('horloge').textContent = dateHeure;
}

setInterval(mettreAJourHorloge, 1000);
mettreAJourHorloge(); // Appel initial pour afficher tout de suite l'heure

document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const newFormBtn = document.getElementById('newFormBtn');
    const resetDbBtn = document.getElementById('resetDbBtn');
    const activeFormsContainer = document.getElementById('activeForms');
    const savedFormsList = document.getElementById('savedFormsList');

    // Initialisation
    let formCounter = loadCounter();
    loadSavedForms();

    // Événements
    newFormBtn.addEventListener('click', createNewForm);
    resetDbBtn.addEventListener('click', resetDatabase);

    // Fonctions principales
    function createNewForm() {
        formCounter++;
        saveCounter(formCounter);
        const formId = `form-${formCounter}`;
        openForm(formId, `Note #${formCounter}`, '');
    }

    function openForm(id, title, content) {
        // Fermer tous les formulaires ouverts d'abord
        activeFormsContainer.innerHTML = '';
        
        const formCard = document.createElement('div');
        formCard.className = 'form-card';
        formCard.dataset.id = id;

        formCard.innerHTML = `
            <div class="form-header">
                <input type="text" class="form-title" value="${title}" placeholder="Titre">
            </div>
            <textarea placeholder="Écrivez votre note ici...">${content}</textarea>
                <div class="form-actions">
                    <button type="button" class="btn btn-primary save-btn">Enregistrer</button>
                    <button type="button" class="btn btn-danger delete-btn">Supprimer</button>
                    <button type="button" class="btn btn-warning close-btn">Fermer</button>
                </div>
        `;

        activeFormsContainer.appendChild(formCard);
        setupFormEvents(formCard, id);
    }

    function setupFormEvents(formCard, formId) {
        const saveBtn = formCard.querySelector('.save-btn');
        const deleteBtn = formCard.querySelector('.delete-btn');
        const closeBtn = formCard.querySelector('.close-btn');
        const titleInput = formCard.querySelector('.form-title');
        const textarea = formCard.querySelector('textarea');

        saveBtn.addEventListener('click', () => saveForm(formId));
        deleteBtn.addEventListener('click', () => deleteForm(formId, formCard));
        closeBtn.addEventListener('click', () => closeForm());
        titleInput.addEventListener('input', () => debounce(() => saveForm(formId), 500));
        textarea.addEventListener('input', () => debounce(() => saveForm(formId), 1000));
    }

    function closeForm() {
        activeFormsContainer.innerHTML = '';
    }

    // Gestion des données
    function saveForm(formId) {
        const formCard = document.querySelector(`.form-card[data-id="${formId}"]`);
        if (!formCard) return;

        const formData = {
            id: formId,
            title: formCard.querySelector('.form-title').value,
            content: formCard.querySelector('textarea').value,
            timestamp: new Date().toISOString()
        };

        const allForms = getAllForms();
        allForms[formId] = formData;
        localStorage.setItem('allForms', JSON.stringify(allForms));

        loadSavedForms();
        showSaveConfirmation(formCard);
    }

    function loadSavedForms() {
        savedFormsList.innerHTML = '';

        const allForms = getAllForms();
        const sortedForms = Object.values(allForms)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (sortedForms.length === 0) {
            savedFormsList.innerHTML = `
                <div class="empty-state">
                    <div>📝</div>
                    <p>Aucune note sauvegardée</p>
                </div>
            `;
            return;
        }

        sortedForms.forEach(form => {
            const formItem = document.createElement('div');
            formItem.className = 'saved-form-item';
            formItem.innerHTML = `
                <h3>${form.title || 'Sans titre'}</h3>
                <p>${form.content || ''}</p>
                <small>${new Date(form.timestamp).toLocaleString()}</small>
            `;
            formItem.addEventListener('click', () => openForm(form.id, form.title, form.content));
            savedFormsList.appendChild(formItem);
        });
    }

    // Fonctions utilitaires
    function getAllForms() {
        try {
            return JSON.parse(localStorage.getItem('allForms')) || {};
        } catch {
            return {};
        }
    }

    function loadCounter() {
        return parseInt(localStorage.getItem('formCounter')) || 0;
    }

    function saveCounter(value) {
        localStorage.setItem('formCounter', value);
    }

    function showSaveConfirmation(formCard) {
        const saveBtn = formCard.querySelector('.save-btn');
        if (!saveBtn) return;
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ Sauvé';
        setTimeout(() => { saveBtn.textContent = originalText; }, 1000);
    }

    function deleteForm(formId, formCard) {
        if (!confirm('Supprimer ce formulaire?')) return;
        formCard.remove();
        const allForms = getAllForms();
        delete allForms[formId];
        localStorage.setItem('allForms', JSON.stringify(allForms));
        loadSavedForms();
}

    function resetDatabase() {
        if (confirm('Voulez-vous vraiment tout supprimer ?')) {
            localStorage.clear();
            activeFormsContainer.innerHTML = '';
            savedFormsList.innerHTML = `
                <div class="empty-state">
                    <div>🔄</div>
                    <p>Données réinitialisées</p>
                </div>
            `;
            formCounter = 0;
            saveCounter(0);
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
});