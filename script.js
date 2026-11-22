/* COLLEGAMENTO AGLI ELEMENTI HTML */

const incomeAmountInput = document.getElementById('incomeAmount');
const incomeDescriptionInput = document.getElementById('incomeDescription');
const incomeDateInput = document.getElementById('incomeDate');
const addIncomeButton = document.getElementById('incomeButton');
const incomeList = document.getElementById('incomeList');

const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');


const addBtn = document.getElementById('addBtn');

const expenseList = document.getElementById('expenseList');
const totalEl = document.getElementById('total');
const filterCategory = document.getElementById('filterCategory');

const chartCanvas = document.getElementById('expenseChart');

const filterMonth = document.getElementById("filterMonth");

const resetFiltersBtn = document.getElementById("resetFilters");

/* 🔹 2. ARRAY DELLE SPESE (IL NOSTRO DATABASE) */
let expenses = []; // Array per le spese

let incomes = []; // Array per le entrate

let editingIncomeId = null; // Memorizza l'Id dell'entrata che stiamo modificando

let editingId = null; //  Serve per sapere se sto aggiungendo o modificando una spesa

let expenseChart = null; // Serve per aggiornare il grafico.

/* 🔹 3. FUNZIONE OTTENERE LA DATA DI OGGI */
function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* 🔹 4. FUNZIONE PER AGGIUNGERE UNA SPESA */
function addExpense() {
    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value); // Number() trasforma il testo in numero
    const category = categorySelect.value;

    if (!category) {
        alert("Seleziona una categoria");
        return;
    }

    let date = dateInput.value;
    if (date === "") {
        alert("Non hai selezionato una data. Verrà usata quella di oggi");
        date = getTodayDate();
        dateInput.value = date;
    }

    // Controllo validazione prezzo 
    if (amountInput.value.trim() === "") {
        alert("Inserisci un importo");
        return;
    }

    if (amount <= 0 || isNaN(amount)) {
        alert("L'importo deve essere magiore di 0");
        return;
    }
    // Controllo descrizione
    if (description === "") {
        alert("Inserisci una descrizione");
        return;
    }

    // Controllo se sto modificando o aggiungendo
    if (editingId !== null) {
        const expense = expenses.find(exp => exp.id === editingId);

        expense.description = description;
        expense.amount = amount;
        expense.category = category;
        expense.date = date;

        editingId = null;
    } else { // Aggiunta
        expenses.push({ // push() aggiunge un elemento all'array
            id: Date.now(),
            description,
            amount,
            category,
            date
        });
    }

    saveExpenses();
    renderExpenses();

    // Pulizia Input
    descriptionInput.value = "";
    amountInput.value = "";
    dateInput.value = getTodayDate();
}

/* 🔹 5. FUNZIONE PER AGGIUNGERE UNA SPESA */
function addIncome() {
    const description = incomeDescriptionInput.value.trim();
    const amount = Number(incomeAmountInput.value);
    let date = incomeDateInput.value;

    // Controllo importo
   if (description === '') {
        alert('Inserisci una descrizione');
        return;
    }

    // Controllo importo
    if (incomeAmountInput.value.trim() === '' || !Number.isFinite(amount) || amount <= 0) {
        alert('Inserisci un importo maggiore di 0');
        return;
    }

    // Se non viene scelta una data, usa quella corrente
    if (date == '') {
        date = getTodayDate();
    }

    // Controllo se sto modificando o aggiungendo
    if(editingIncomeId !== null) {
        //Cerco l'entrata da modificare tramite ID
        const income = incomes.find(
            income => income.id === editingIncomeId
        );
        if(!income) return;

        // Aggiorno i dati dell'entrata esistente
        income.description = description;
        income.amount = amount;
        income.date = date;

        // Termino la modalità modifca
        editingIncomeId = null;

        // Ripristino il testo del pulsante
        addIncomeButton.textContent = "Aggiungi Entrta";
    } else {
        // Creo un oggetto che rappressnta le entrate
    const income = {
        id: Date.now(),
        description: description,
        amount: amount,
        date: date
    };
    // Aggiungo l'oggetto all'array
    incomes.push(income);
    }

     // Salvo le entrate nel LocalStorage    
    saveIncomes();
     // Aggiorno lo storico delle entrate
    renderIncomes();
    /* Per verificare il risultato nella console
    console.log(incomes);*/

    // Pulisco i campi dopo l'inserimento
    incomeDescriptionInput.value = '';
    incomeAmountInput.value = '';
    incomeDateInput.value = getTodayDate();
}

/* 🔹 6. MOSTRARE LE ENTRATE A SCHERMO */
function renderIncomes() {

    // Svuoto la lista prima di aggiornarla 
    incomeList.innerHTML = "";

    // Scorro tutte le entrate presenti nell'array
    incomes.forEach(income => {
        const li = document.createElement('li');

        // Insersico le informazioni dell'entrata
        li.innerHTML = `
        <span>
        ${income.description} <br>
        📅 ${income.date}
        </span>
        <div>
        <strog> + €${income.amount.toFixed(2)}</strong>
        <button onclick="editIncome(${income.id})">✏️</button>
        <button onclick="deleteIncome(${income.id})">🗑️</button>
        </div>  
        `;

        // Aggungo l'elemento alla lista HTML
        incomeList.appendChild(li);
    });
}

/* 🔹 7. FUNZIONE PER ELIMINARE LE ENTRATE */
function deleteIncomes(id) {
    const confirmed = confirm(
        "Sei sicuro di voler eliminare questa entrata?"
    );
    if (!confirmed) return;

    // Mantengo tutte le entrate trannte quella selezionata
    incomes = incomes.filter(income => income.id !== id);

    // Aggionrno il salbataggio e la visualizzazione
    saveIncomes();
    renderIncomes();
}

/* 🔹 8. FUNZIONE PER MODIFICARE UN'ENTRATA */
function editIncome(id) {

    //Cerco l'entrat tramtie id
    const income = incomes.find(income => income.id === id);
    if(!income) return;

    // Riempio il modulo con dati esistenti
    incomeDescriptionInput.value = income.description;
    incomeAmountInput.value = income.amount;
    incomeDateInput.value = income.date;

    // Memorizzo quale entrata sto modificando
    editingIncomeId = id;

    // Cambio il testo del pulsante
    addIncomeButton.textContent = "Salva Modifica";
}


/* 🔹 9. FUNZIONE PERMOSTRARE LE SPESE A SCHERMO */
function renderExpenses() {
    expenseList.innerHTML = "";

    const filteredExpenses = getFilteredExpenses();

    filteredExpenses.forEach(exp => {
        const li = document.createElement('li');

        li.innerHTML = `
            <span>
                ${exp.description} (${exp.category})<br>
                    📅 ${exp.date}
            </span>
                <div>
                    <strong> €${exp.amount.toFixed(2)} </strong>
                    <button onclick="editExpense(${exp.id})">✏️</button>
                    <button onclick="deleteExpense(${exp.id})">🗑️</button>
                </div>
        `;

        expenseList.appendChild(li);
    });

    updateTotal(); // Aggiorna il totale per categoria
    renderChart(); // Aggiorna il grafico
}

/* 🔹 10. CALCOLO DEL TOTALE */
const totalTitle = document.getElementById("totalTitle");


function updateTotal() {

    const filtered = getFilteredExpenses();
    const total = filtered.reduce(
        (sum, exp) => sum + exp.amount,
        0
    );


    // aggiorna SOLO il numero
    totalEl.textContent = total.toFixed(2);

    // Nessuna selezione
    if (!filterCategory.value) {
        totalTitle.firstChild.textContent = "Totale: €";
        return;
    }

    // Tutte le categorie
    if (filterCategory.value === "all" && filterMonth.value === "") {
        totalTitle.firstChild.textContent = "Totale: € ";
        return;
    }
    let label = "Totale";
    if (filterCategory.value !== "all") {
        label += ` (${filterCategory.value}) `
    }
    if (filterMonth.value)
        label += `${filterMonth.value} `;

    totalTitle.firstChild.textContent = `${label}: € `;
}


/* 🔹 11. FUNZIONE ELIMINA SPESA */
function deleteExpense(id) {
    const confirmed = confirm("Sei sicuro di voler eliminare questa spesa?");

    if (!confirmed) return; // Se annulla, esce dalla funzione

    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    renderExpenses();
}

/* 🔹 12. FUNZIONE MODIFICA SPESA */
function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;

    descriptionInput.value = expense.description;
    amountInput.value = expense.amount;
    categorySelect.value = expense.category;
    dateInput.value = expense.date;
    editingId = id;
}

/* 🔹 13. LOCAL STORAGE */
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadExpenses() {
    const data = localStorage.getItem("expenses");
    if (data) {
        expenses = JSON.parse(data);
        renderExpenses();
    }
}

function saveIncomes() {
    localStorage.setItem("incomes", JSON.stringify(incomes));
}

function loadIncomes() { // Carica le entrate dal Local Storage
    const data = localStorage.getItem("incomes");
    if (data) {
        incomes = JSON.parse(data);
    }

    // Visualizzo le entrate caricate
    renderIncomes();

}


/* 🔹 14. FUNZIONE PER CALCOLARE LE SPESE PER CATEGORIA */
function getExpensesByCategory() {
    const totals = {};

    expenses.forEach(exp => {
        if (!totals[exp.category]) {
            totals[exp.category] = 0;
        }
        totals[exp.category] += exp.amount;
    });
    return totals;
}

/* 🔹 15. FUNZIONE PER DISEGANRE IL GRAFICO */
function renderChart() {
    const dataByCategory = getChartData();
    const labels = Object.keys(dataByCategory);
    const data = Object.values(dataByCategory);

    if (labels.length === 0) {
        if (expenseChart) {
            expenseChart.destroy();
            expenseChart = null;
        }
        return;
    }

    // Se il grafico esiste già, lo distruggo

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    "#ff6384",
                    "#36a2eb",
                    "#ffce56",
                    "#4bc0c0",
                    "#9966ff"
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/* 🔹 16. FUNZIONE PER FILTRARE LE SPESE */
function getFilteredExpenses() {
    const category = filterCategory.value;
    const month = filterMonth.value; // Formato YYYY-MM

    // Nessuna categoria selezionata
    if (!category) return [];
    return expenses.filter(exp => {

        // Filtro per categoria
        const matchCategory = category === "all" || exp.category === category;

        // Filtro mese
        const matchMonth = month === "" || exp.date.startsWith(month);

        return matchCategory && matchMonth;
    });
}

/* 🔹 17. FUNZIONE CHE AGGREGA PER CATEGORIA SULLE SPESE FILTRATE */
function getChartData() {
    const filtered = getFilteredExpenses();
    const totals = {};

    filtered.forEach(exp => {
        totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return totals;
}

/* 🔹 18. FUNZIONE RESET FILTRI */
function resetFilters() {
    // Reset valori categorie
    filterCategory.value = "";

    // Reset valori mese <input type="month"> non accetta "all"
    filterMonth.value = "";

    // ri-render completo
    renderExpenses();

}

/* 🔹 19. FUNZIONE DISABILITA FILTRI */
function updateResetButtonState() {
    resetFiltersBtn.disabled = filterCategory.value === "all";
}

/* 🔹 20. EVENTI */
addBtn.addEventListener("click", addExpense);
addIncomeButton.addEventListener("click", addIncome);

filterCategory.addEventListener("change", renderExpenses);
filterMonth.addEventListener("change", renderExpenses);
resetFiltersBtn.addEventListener("click", resetFilters);

// Carica all'avvio
loadExpenses();
loadIncomes();
dateInput.value = getTodayDate(); // Imposta la data di oggi come default
incomeDateInput.value = getTodayDate(); // Imposta la data di oggi come default