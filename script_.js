document.addEventListener("DOMContentLoaded", () => {
    const formContainer = document.getElementById("formContainer");
    const addFormBtn = document.getElementById("addForm");
  
    function loadForms() {
      formContainer.innerHTML = "";
      const forms = JSON.parse(localStorage.getItem("forms")) || [];
      forms.forEach((form, index) => {
        createForm(form.text, index);
      });
    }
  
    function saveForm(index, text) {
      const forms = JSON.parse(localStorage.getItem("forms")) || [];
      forms[index] = { text };
      localStorage.setItem("forms", JSON.stringify(forms));
    }
  
    function deleteForm(index) {
      let forms = JSON.parse(localStorage.getItem("forms")) || [];
      forms.splice(index, 1);
      localStorage.setItem("forms", JSON.stringify(forms));
      loadForms();
    }
  
    function addNewForm() {
      const forms = JSON.parse(localStorage.getItem("forms")) || [];
      forms.push({ text: "" });
      localStorage.setItem("forms", JSON.stringify(forms));
      loadForms();
    }
  
    function createForm(text = "", index) {
      const formBlock = document.createElement("div");
      formBlock.className = "form-block";
  
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.addEventListener("input", () => saveForm(index, textarea.value));
  
      const actions = document.createElement("div");
      actions.className = "form-actions";
  
      const saveBtn = document.createElement("button");
      saveBtn.className = "save";
      saveBtn.textContent = "💾 Sauvegarder";
      saveBtn.addEventListener("click", () => {
        saveForm(index, textarea.value);
        alert("Formulaire sauvegardé !");
      });
  
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Supprimer";
      deleteBtn.addEventListener("click", () => {
        if (confirm("Supprimer ce formulaire ?")) deleteForm(index);
      });
  
      actions.appendChild(saveBtn);
      actions.appendChild(deleteBtn);
  
      formBlock.appendChild(textarea);
      formBlock.appendChild(actions);
  
      formContainer.appendChild(formBlock);
    }
  
    addFormBtn.addEventListener("click", addNewForm);
    loadForms();
  });
  