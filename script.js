
class ToDoList {
  constructor() {
    this.tasks = []
    this.criterioOrdinamento = "priorita"
  }

  addTask(task) {
    this.tasks.push(task);
    this.ordinaTasks()
  }

  changeCriterioOrdinamento(criterio) {
    this.criterioOrdinamento = criterio
    console.log(this.criterioOrdinamento)
    this.ordinaTasks()
  }

  ordinaTasks() {
    switch (this.criterioOrdinamento) {
      case "priorita":
        this.tasks.sort((a, b) => {
          if (a.priorita == b.priorita)
            return a.scadenza.localeCompare(b.scadenza)
          return b.priorita - a.priorita
        });
        break

      case "scadenza":
        this.tasks.sort((a, b) => {
          if (a.scadenza == b.scadenza)
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
const livelliPriorita = ["<div class='badge badge-soft badge-accent'>Bassa</div>", "<div class='badge badge-soft badge-warning'>Media</div>", "<div class='badge badge-soft badge-error'>Alta</div>", "<div class='badge badge-soft badge-primary'>Urgente</div>"]
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
let barraRicerca = null
let alertVisibile = false

document.addEventListener("DOMContentLoaded", init)

function init() {
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
  barraRicerca = document.getElementById("ricerca")
  if (localStorage.length > 0)
    uploadFromLocalStorage()
}

function getInput() {
  const task = {
    titolo: document.getElementById('titolo').value,
    descrizione: document.getElementById('descrizione').value,
    scadenza: document.getElementById('scadenza').innerText,
    dataInserimento: new Date(),
    priorita: document.getElementById('priorita').value,
    scaduta: false,
    completata: false
  };

  if (!task.titolo) {
    mostraAlert("error", "Inserisci un titolo per la task!")
    return
  }

  if (task.scadenza === "Scadenza") {
    mostraAlert("error", "Seleziona una data di scadenza valida!")
    return
  }

  const scadenza = new Date(task.scadenza)

  if (scadenza < task.dataInserimento) {
    mostraAlert("warning", "La data di scadenza non può essere nel passato!")
    return
  }

  if (!task.priorita || isNaN(task.priorita)) {
    mostraAlert("error", "Seleziona un livello di priorità!")
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

function aggiornaLista(tasks) {
  lista.innerHTML = ""
  if (!tasks)
    tasks = toDoList.getTasks()
  saveTasks(toDoList.getTasks())
  counterDaCompletare.innerText = tasks.length
  counterCompletate.innerText = completate
  saveCounterCompletate(completate)
  counterScadute.innerText = scadute
  saveCounterScadute(scadute)

  tasks.forEach((task, i) => {
    const tr = document.createElement("tr");
    tr.className = "hover";

    // Checkbox
    const th = document.createElement("th");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = selezionabili ? "checkbox row-cb" : "checkbox hidden row-cb";
    checkbox.dataset.index = i;
    th.appendChild(checkbox);
    tr.appendChild(th);

    // Titolo + info
    const tdTitolo = document.createElement("td");
    const titoloWrapper = document.createElement("div"); // wrapper flex solo interno alla cella
    titoloWrapper.className = "flex items-center gap-2";

    const infoBtn = document.createElement("span");
    infoBtn.className = "text-blue-500 cursor-pointer flex-shrink-0";
    infoBtn.dataset.index = i;
    infoBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                            </svg>`;
    titoloWrapper.appendChild(infoBtn);

    const titoloSpan = document.createElement("span");
    titoloSpan.textContent = task.titolo;
    if (task.completata) titoloSpan.className = "line-through text-grey-400";
    else if (task.scaduta) titoloSpan.className = "text-red-500"
    titoloWrapper.appendChild(titoloSpan);

    tdTitolo.appendChild(titoloWrapper);
    tr.appendChild(tdTitolo);

    // Scadenza
    const tdScadenza = document.createElement("td");
    const scadenzaWrapper = document.createElement("div");
    scadenzaWrapper.className = "flex items-center gap-2";

    const editScadenza = document.createElement("span");
    editScadenza.className = "text-blue-500 cursor-pointer";
    editScadenza.dataset.index = i;
    editScadenza.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                </svg>`;
    scadenzaWrapper.appendChild(editScadenza);

    const scadenzaSpan = document.createElement("span");
    scadenzaSpan.textContent = task.scadenza;
    if (task.completata) scadenzaSpan.className = "line-through text-grey-400";
    else if (task.scaduta) scadenzaSpan.className = "text-red-500"
    scadenzaWrapper.appendChild(scadenzaSpan);

    tdScadenza.appendChild(scadenzaWrapper);
    tr.appendChild(tdScadenza);

    // Priorità
    const tdPriorita = document.createElement("td");
    const prioritaWrapper = document.createElement("div");
    prioritaWrapper.className = "flex items-center gap-2";

    const editPriorita = document.createElement("span");
    editPriorita.className = "text-blue-500 cursor-pointer";
    editPriorita.dataset.index = i;
    editPriorita.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                </svg>`;
    prioritaWrapper.appendChild(editPriorita);

    const prioritaSpan = document.createElement("span");
    prioritaSpan.innerHTML = livelliPriorita[task.priorita];
    prioritaWrapper.appendChild(prioritaSpan);

    tdPriorita.appendChild(prioritaWrapper);
    tr.appendChild(tdPriorita);

    // Azioni
    const tdAzioni = document.createElement("td");
    const azioniWrapper = document.createElement("div");
    azioniWrapper.className = "flex items-center gap-2 justify-start whitespace-nowrap";

    const statoSpan = document.createElement("span")
    if (task.completata)
      statoSpan.innerHTML = '<div class="badge badge-soft badge-success">Completata</div>'
    else if (task.scaduta)
      statoSpan.innerHTML = '<div class="badge badge-soft badge-error">Scaduta</div>'
    else
      statoSpan.innerHTML = '<div class="badge badge-soft badge-info">Da completare </div>'
    azioniWrapper.appendChild(statoSpan)


    const btnElimina = document.createElement("button");
    btnElimina.className = "btn btn-circle btn-xs"; // compatto DaisyUI
    btnElimina.dataset.index = i;
    btnElimina.onclick = () => eliminaTask(btnElimina);
    btnElimina.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            `
    azioniWrapper.appendChild(btnElimina);

    const btnCompleta = document.createElement("button");
    btnCompleta.className = "btn btn-circle btn-xs";
    btnCompleta.dataset.index = i;
    btnCompleta.onclick = () => completaTask(btnCompleta);
    btnCompleta.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>`;
    azioniWrapper.appendChild(btnCompleta);

    tdAzioni.appendChild(azioniWrapper);
    tr.appendChild(tdAzioni);

    lista.appendChild(tr);
  });


  lista.addEventListener("click", (e) => {
    //mostra descrizione
    if (e.target.classList.contains("btn-descrizione")) {
      const index = e.target.dataset.index;
      const task = toDoList.getTasks()[index];
      document.getElementById("modalDescTitle").textContent = task.titolo;
      document.getElementById("modalDesc").textContent = task.descrizione;
      document.getElementById("modalDescToggle").checked = true;
    }
    //modifica scadenza
    if (e.target.classList.contains("btn-editScadenza")) {
      const index = e.target.dataset.index
      const task = toDoList.getTasks()[index]
      document.getElementById("modalScadTitle").textContent = task.titolo
      document.getElementById("modalScadToggle").checked = true
      document.getElementById("salvaScadenzaBtn").dataset.index = index
    }
    //modifica priorita
    if (e.target.classList.contains("btn-editPriorita")) {
      const index = e.target.dataset.index
      const task = toDoList.getTasks()[index]
      document.getElementById("modalPriorTitle").textContent = task.titolo
      document.getElementById("modalPriorToggle").checked = true
      document.getElementById("salvaPrioritaBtn").dataset.index = index
    }
  });
}

function rendiSelezionabili() {
  document.querySelectorAll(".row-cb").forEach(cb => {
    cb.classList.remove("hidden")
  });
  pulsanteSelezione.disabled = true
  pulsanteCreaTask.disabled = true
  pulsanteCompletate.disabled = false
  pulsanteElimina.disabled = false
  pulsanteSelezionaTutto.disabled = false
}

function rendiNonSelezionabili() {
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

function segnaComeCompletate() {
  const selected = getSelectedTasks()
  if (selected.length > 0) {
    completate += selected.length
    rimuovi(selected)
  }
  else
    mostraAlert("warning", "Non ci sono tasks selezionate")

}

function selezionaTutto() {
  document.querySelectorAll(".row-cb").forEach(cb => {
    cb.checked = true
  });
}

async function elimina() {
  const selected = getSelectedTasks()
  if (selected.length > 0) {
    const conferma = await mostraAlertConferma("Sei sicuro di voler elminare questa task?")
    if (conferma)
      rimuovi(selected)
  }
  else
    mostraAlert("warning", "Non ci sono tasks selezionate")

}

function rimuovi(selected) {
  selected.forEach(task => {
    toDoList.removeTask(task)
    if (task.scaduta)
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
    if (taskDay < today) {
      scadute++
      task.scaduta = true
    }
    else if (task.scaduta) {
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

function uploadFromLocalStorage() {
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

function modificaScadenza() {
  const index = document.getElementById("salvaScadenzaBtn").dataset.index
  const nuovaScadenza = document.getElementById("scadenzaInModal").innerText
  const dataNuovaScadenza = new Date(nuovaScadenza)
  const today = new Date()

  if (dataNuovaScadenza < today) {
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

function modificaPriorita() {
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

function filtraTasks() {
  const tasks = toDoList.getTasks()
  let testo = barraRicerca.value.toLowerCase()
  testo = testo.trim()
  let filtrate = tasks.filter(t => t.titolo.toLowerCase().includes(testo))
  aggiornaLista(filtrate)
}

async function eliminaTask(bottone) {
  const conferma = await mostraAlertConferma("Sei sicuro di voler elminare questa task?")
  if (conferma) {
    const index = bottone.getAttribute("data-index")
    toDoList.removeTask(toDoList.getTasks()[index])
    aggiornaLista()
  }
}

function completaTask(bottone) {

}

function mostraDaCompletare() {
  const tasks = toDoList.getTasks()
  aggiornaLista(tasks.filter(t => {
    if (!t.completata && !t.scaduta)
      return true
    return false
  }))
}

function mostraCompletate() {
  const tasks = toDoList.getTasks()
  aggiornaLista(tasks.filter(t => {
    if (t.completata && !t.scaduta)
      return true
    return false
  }))
}

function mostraScadute() {
  const tasks = toDoList.getTasks()
  aggiornaLista(tasks.filter(t => {
    if (!t.completata && t.scaduta)
      return true
    return false
  }))
}

function mostraAlert(tipo, messaggio) {
  if (alertVisibile) return
  const container = document.getElementById('alertContainer');
  if (!container) return;

  // Scegli lo stile in base al tipo
  const classiAlert = {
    error: 'alert alert-error',
    warning: 'alert alert-warning'
  };

  const alertBox = document.createElement('div');
  alertBox.setAttribute('role', 'alert');
  alertBox.className = `${classiAlert[tipo] || classiAlert.info} shadow-lg flex items-center gap-3 transition-opacity duration-500`;

  alertBox.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 4a8 8 0 110 16 8 8 0 010-16z"/>
    </svg>
    <span>${messaggio}</span>
  `;

  container.appendChild(alertBox);
  alertVisibile = true;
  setTimeout(() => {
    alertBox.style.opacity = '0';

    // Dopo mezzo secondo (quando l’animazione finisce), rimuovi dal DOM
    setTimeout(() => {
      alertBox.remove();
      alertVisibile = false;
    }, 500);
  }, 2000);

}

function mostraAlertConferma(messaggio) {
  return new Promise((resolve) => {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const alertBox = document.createElement('div');
    alertBox.setAttribute('role', 'alert');
    alertBox.className = `alert alert-info shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300`;

    alertBox.innerHTML = `
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 4a8 8 0 110 16 8 8 0 010-16z"/>
        </svg>
        <span>${messaggio}</span>
      </div>
      <div class="flex gap-2 mt-2 sm:mt-0">
        <button class="btn btn-sm btn-primary conferma-btn">Conferma</button>
        <button class="btn btn-sm btn-ghost annulla-btn">Annulla</button>
      </div>
    `;

    container.appendChild(alertBox);

    // Aggiungi listener ai pulsanti
    alertBox.querySelector('.conferma-btn').addEventListener('click', () => {
      alertBox.remove();
      resolve(true);
    });

    alertBox.querySelector('.annulla-btn').addEventListener('click', () => {
      alertBox.remove();
      resolve(false);
    });
  });
}
