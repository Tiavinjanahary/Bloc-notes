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
    newFormBtn.addEventListener('click', handleNewForm);
    if (resetDbBtn) resetDbBtn.addEventListener('click', resetDatabase);

    // Fonctions principales
    function handleNewForm() {
        formCounter++;
        saveCounter(formCounter);
        createForm(`form-${formCounter}`, `Note #${formCounter}`, '');
    }

    function createForm(id, title, content) {
        const formCard = document.createElement('div');
        formCard.className = 'form-card';
        formCard.dataset.id = id;

        formCard.innerHTML = `
            <div class="form-header">
                <input type="text" class="form-title" value="${title}" placeholder="Titre de la note">
            </div>
            <textarea placeholder="Écrivez votre note ici...">${content}</textarea>
            <div class="form-footer">
                <button type="button" class="btn btn-success save-btn">Enregistrer</button>
                <button type="button" class="btn btn-danger delete-btn">Supprimer</button>
            </div>
        `;

        activeFormsContainer.appendChild(formCard);
        setupFormEvents(formCard, id);
        autoExpandTextarea(formCard.querySelector('textarea'));
    }

    function setupFormEvents(formCard, formId) {
        const saveBtn = formCard.querySelector('.save-btn');
        const deleteBtn = formCard.querySelector('.delete-btn');
        const titleInput = formCard.querySelector('.form-title');
        const textarea = formCard.querySelector('textarea');

        saveBtn.addEventListener('click', () => saveForm(formId));
        deleteBtn.addEventListener('click', () => deleteForm(formId, formCard));
        titleInput.addEventListener('input', () => debouncedSave(formId));
        
        let timeout;
        textarea.addEventListener('input', function() {
            clearTimeout(timeout);
            autoExpandTextarea(this);
            timeout = setTimeout(() => saveForm(formId), 2000);
        });
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

        showSaveConfirmation(formCard);
        loadSavedForms();
    }

    function loadSavedForms() {
        const allForms = getAllForms();
        const sortedForms = Object.values(allForms)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        savedFormsList.innerHTML = sortedForms.length ? '' : `
            <div class="empty-state">
                <div>📝</div>
                <p>Aucun formulaire sauvegardé</p>
            </div>
        `;

        sortedForms.forEach(form => {
            const formItem = document.createElement('div');
            formItem.className = 'saved-form-item';
            formItem.dataset.id = form.id;
            formItem.innerHTML = `
                <h3>${form.title}</h3>
                <p>${form.content.substring(0, 50)}${form.content.length > 50 ? '...' : ''}</p>
                <small>${new Date(form.timestamp).toLocaleString()}</small>
            `;
            formItem.addEventListener('click', () => {
                if (!document.querySelector(`.form-card[data-id="${form.id}"]`)) {
                    createForm(form.id, form.title, form.content);
                }
            });
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

    function autoExpandTextarea(textarea) {
        textarea.style.width = 'auto';
        textarea.style.width = `${Math.max(textarea.scrollWidth, 350)}px`;
        const formCard = textarea.closest('.form-card');
        if (formCard) formCard.style.width = `${textarea.scrollWidth + 40}px`;
    }

    function showSaveConfirmation(formCard) {
        const saveBtn = formCard.querySelector('.save-btn');
        if (!saveBtn) return;
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ Sauvegardé';
        setTimeout(() => { saveBtn.textContent = originalText; }, 2000);
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
        if (!confirm('Réinitialiser TOUTES les notes?')) return;
        
        localStorage.clear();
        activeFormsContainer.innerHTML = '';
        savedFormsList.innerHTML = `
            <div class="empty-state">
                <div>🔄</div>
                <p>Base réinitialisée</p>
            </div>
        `;
        formCounter = 0;
        saveCounter(0);
    }

    // Optimisation
    const debouncedSave = debounce(saveForm, 500);
    function debounce(fn, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    }
});