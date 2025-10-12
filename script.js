
class ToDoList {
  constructor() {
    this.tasks = []
    this.criterioOrdinamento = "priorita"
  }

  addTask(task) {
    this.tasks.push(task);
    this.ordinaTasks()
  }

  changeCriterioOrdinamento(criterio){
    this.criterioOrdinamento = criterio
    console.log(this.criterioOrdinamento)
    this.ordinaTasks()
  }

  ordinaTasks(){
    switch(this.criterioOrdinamento){
      case "priorita":
        this.tasks.sort((a, b) => {
          if(a.priorita == b.priorita)
            return a.scadenza.localeCompare(b.scadenza)
          return b.priorita - a.priorita
        });
        break
      
      case "scadenza":
        this.tasks.sort((a, b) => {
          if(a.scadenza == b.scadenza)
            return b.priorita - a.priorita
          return a.scadenza.localeCompare(b.scadenza)          
        });
        break

      case "titolo":
        this.tasks.sort((a, b) => {
          return a.titolo.localeCompare(b.titolo)         
        });
        break

      case "inserimento":
        this.tasks.sort((a, b) => {
          return a.dataInserimento <= b.dataInserimento         
        });
        break
    }
  }

  removeTask(task) {
    this.tasks = this.tasks.filter(t => t !== task);
  }

  getTasks() {
    return [...this.tasks];
  }

}
const toDoList = new ToDoList()
const livelliPriorita = ["Bassa", "Media", "Alta", "Urgente"]
let counterDaCompletare = null
let counterCompletate = null
let counterScadute = null
let lista = null
let selezionabili = false
let pulsanteSelezione = null
let pulsanteCreaTask = null
let pulsanteElimina = null
let pulsanteSelezionaTutto = null
let pulsanteCompletate = null
let inputTitolo = null
let inputDescrizione = null
let inputScadenza = null
let inputCalendario = null
let inputPriorita = null
let completate = 0
let scadute = 0
let selectCriterioOrdinamento = null

document.addEventListener("DOMContentLoaded", init)

function init(){
  counterDaCompletare = document.getElementById("nDaCompletare")
  counterCompletate = document.getElementById("nCompletate")
  counterScadute = document.getElementById("nScadute")
  lista = document.getElementById('lista')
  pulsanteSelezione = document.getElementById('btnSelezione')
  pulsanteCreaTask = document.getElementById('btnCreaTask')
  pulsanteElimina = document.getElementById('btnElimina')
  pulsanteCompletate = document.getElementById('btnCompletate')
  pulsanteSelezionaTutto = document.getElementById('btnSelezionaTutto')
  inputTitolo = document.getElementById('titolo')
  inputDescrizione = document.getElementById('descrizione')
  inputScadenza = document.getElementById('scadenza')
  inputCalendario = document.getElementById('calendario')
  inputPriorita = document.getElementById('priorita')
  selectCriterioOrdinamento = document.getElementById('ordinamento')
  if(localStorage.length > 0)
    uploadFromLocalStorage()
}

function getInput(){  
    const task = {
        titolo: document.getElementById('titolo').value,
        descrizione: document.getElementById('descrizione').value,
        scadenza: document.getElementById('scadenza').innerText,
        dataInserimento: new Date(),
        priorita: document.getElementById('priorita').value,
        scaduta: false
    };

    if (!task.titolo) {
        alert("Inserisci un titolo per la task!")
        return
    }

    if (task.scadenza === "Scadenza") {
        alert("Seleziona una data di scadenza valida!")
        return
    }

    const scadenza = new Date(task.scadenza)

    if (scadenza < task.dataInserimento) {
        alert("La data di scadenza non può essere nel passato!")
        return
    }

    if (!task.priorita || isNaN(task.priorita)) {
        alert("Seleziona un livello di priorità!")
        return
    }

    toDoList.addTask(task) 
    aggiornaLista()
    
    inputTitolo.value = ""
    inputDescrizione.value = ""
    inputScadenza.innerText = "Scadenza"
    inputCalendario.value = null
    inputPriorita.selectedIndex = 0
}

function aggiornaLista(){
    lista.innerHTML = ""
    const tasks = toDoList.getTasks()
    saveTasks(tasks)
    counterDaCompletare.innerText = tasks.length
    counterCompletate.innerText = completate
    saveCounterCompletate(completate)
    counterScadute.innerText = scadute
    saveCounterScadute(scadute)

    tasks.forEach((task, i) => {
      const tr = document.createElement("tr");
      tr.className = "hover";
      
      if(task.scaduta){
        tr.innerHTML = `
          <th>
            <input type="checkbox" class="checkbox hidden row-cb" data-index="${i}" />
          </th>
          <td class="flex items-center space-x-2">
            <span class="text-blue-500 cursor-pointer info-btn" data-index="${i}">❓</span>
            <span>${task.titolo}</span>
          </td>
          <td class="text-red-500">
            <span class="text-blue-500 cursor-pointer btn-editScadenza" data-index="${i}">✏️</span>  
            <span>${task.scadenza}</span>
          </td>
          <td>
            <span class="text-blue-500 cursor-pointer btn-editPriorita" data-index="${i}">✏️</span>  
            <span>${livelliPriorita[task.priorita]}</span>
          </td>
        `;

        lista.appendChild(tr);
      }
      else{
        tr.innerHTML = `
          <th>
            <input type="checkbox" class="checkbox hidden row-cb" data-index="${i}" />
          </th>
          <td class="flex items-center space-x-2 ">
            <span class="text-blue-500 cursor-pointer btn-descrizione" data-index="${i}">❓</span>
            <span>${task.titolo}</span>
          </td>
          <td>
            <span class="text-blue-500 cursor-pointer btn-editScadenza" data-index="${i}">✏️</span>  
            <span>${task.scadenza}</span>
          </td>
          <td>
            <span class="text-blue-500 cursor-pointer btn-editPriorita" data-index="${i}">✏️</span>  
            <span>${livelliPriorita[task.priorita]}</span>
          </td>
        `;

        lista.appendChild(tr);
      }
    });

    lista.addEventListener("click", (e) => {
      if(e.target.classList.contains("btn-descrizione")){
        const index = e.target.dataset.index;
        const task = toDoList.getTasks()[index];
        document.getElementById("modalDescTitle").textContent = task.titolo;
        document.getElementById("modalDesc").textContent = task.descrizione;
        document.getElementById("modalDescToggle").checked = true;
      }

      if(e.target.classList.contains("btn-editScadenza")){
        const index = e.target.dataset.index
        const task = toDoList.getTasks()[index]
        document.getElementById("modalScadTitle").textContent = task.titolo
        document.getElementById("modalScadToggle").checked = true
        document.getElementById("salvaScadenzaBtn").dataset.index = index
      }

      if(e.target.classList.contains("btn-editPriorita")){
        const index = e.target.dataset.index
        const task = toDoList.getTasks()[index]
        document.getElementById("modalPriorTitle").textContent = task.titolo
        document.getElementById("modalPriorToggle").checked = true
        document.getElementById("salvaPrioritaBtn").dataset.index = index
      }
    });
}

function rendiSelezionabili(){
  document.querySelectorAll(".row-cb").forEach(cb => {
    cb.classList.remove("hidden")
  });
  pulsanteSelezione.disabled = true
  pulsanteCreaTask.disabled = true
  pulsanteCompletate.disabled = false
  pulsanteElimina.disabled = false
  pulsanteSelezionaTutto.disabled = false
}

function rendiNonSelezionabili(){
  document.querySelectorAll(".row-cb").forEach(cb => {
    cb.classList.add("hidden")
  });
  pulsanteSelezione.disabled = false
  pulsanteCreaTask.disabled = false
  pulsanteCompletate.disabled = true
  pulsanteElimina.disabled = true
  pulsanteSelezionaTutto.disabled = true
}

function getSelectedTasks() {
  const selected = [];
  const checkboxes = document.querySelectorAll(".row-cb");
  const tasks = toDoList.getTasks()

  checkboxes.forEach(cb => {
    if (cb.checked) {
      const index = cb.dataset.index;
      selected.push(tasks[index]);
    }
  });

  return selected;
}

function segnaComeCompletate(){
  const selected = getSelectedTasks()
  completate += selected.length
  rimuovi(selected)
}

function selezionaTutto(){
  document.querySelectorAll(".row-cb").forEach(cb => {
    cb.checked = true
  });
}

function elimina(){
  const selected = getSelectedTasks()
  rimuovi(selected)
}

function rimuovi(selected){
  selected.forEach(task => {
      toDoList.removeTask(task)
      if(task.scaduta)
        scadute--
  })
  rendiNonSelezionabili()
  aggiornaLista()
}

function updateTaskScadute() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // solo data
  const tasks = toDoList.getTasks();
  scadute = 0;

  tasks.forEach(task => {
    const scadenza = new Date(task.scadenza);
    const taskDay = new Date(scadenza.getFullYear(), scadenza.getMonth(), scadenza.getDate());

    // scaduta solo se la data è **precedente a oggi**
    if(taskDay < today){
      scadute++
      task.scaduta = true
    }
    else if(task.scaduta){
      task.scaduta = false
      scadute--
    }
  });
  aggiornaLista()
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  return saved ? JSON.parse(saved) : [];
}

function saveCounterCompletate(counter) {
  localStorage.setItem("counterCompletate", counter);
}

function saveCounterScadute(counter) {
  localStorage.setItem("counterScadute", counter);
}

function loadCounterCompletate() {
  const saved = localStorage.getItem("counterCompletate");
  return saved ? parseInt(saved) : 0;
}

function loadCounterScadute() {
  const saved = localStorage.getItem("counterScadute");
  return saved ? parseInt(saved) : 0;
}

function uploadFromLocalStorage(){
  completate = loadCounterCompletate()
  scadute = loadCounterScadute()
  tasks = loadTasks()
  tasks.forEach(task => {
    toDoList.addTask(task)
  });
  updateTaskScadute()
  aggiornaLista()
}

function cambiaCriterioOrdinamento() {
  const criterio = selectCriterioOrdinamento.value
  toDoList.changeCriterioOrdinamento(criterio)
  aggiornaLista()
}

function modificaScadenza(){
  const index = document.getElementById("salvaScadenzaBtn").dataset.index
  const nuovaScadenza = document.getElementById("scadenzaInModal").innerText
  const dataNuovaScadenza = new Date(nuovaScadenza)
  const today = new Date()
  
  if(dataNuovaScadenza < today){
    alert("La data di scadenza non può essere nel passato!")
    return
  }

  const task = toDoList.getTasks()[index]
  toDoList.removeTask(task)
  task.scadenza = nuovaScadenza
  toDoList.addTask(task)
  toDoList.ordinaTasks()
  updateTaskScadute()
  document.getElementById("modalScadToggle").checked = false;
  aggiornaLista()
}

function modificaPriorita(){
  const index = document.getElementById("salvaPrioritaBtn").dataset.index
  const nuovaPriorita = document.getElementById("prioritaInModal").value
  const task = toDoList.getTasks()[index]
  toDoList.removeTask(task)
  task.priorita = nuovaPriorita
  toDoList.addTask(task)
  toDoList.ordinaTasks()
  document.getElementById("modalPriorToggle").checked = false;
  aggiornaLista()
}