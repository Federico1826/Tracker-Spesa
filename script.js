/* COLLEGAMENTO AGLI ELEMENTI HTML */

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
let expenses = [];

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


/* 🔹 3. FUNZIONE PER AGGIUNGERE UNA SPESA */
function addExpense() {
    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value); // Number() trasforma il testo in numero
    const category = categorySelect.value;

    if(!category) {
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

/* 🔹 5. MOSTRARE LE SPESE A SCHERMO */
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

/* 🔹 6. CALCOLO DEL TOTALE */
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
        if(filterCategory.value !== "all") {
           label += ` (${filterCategory.value}) `
        }
        if (filterMonth.value) 
            label += `${filterMonth.value} `;
        
        totalTitle.firstChild.textContent = `${label}: € `;
    }


/* 🔹 7. FUNZIONE ELIMINA SPESA */
function deleteExpense(id) {
    const confirmed = confirm("Sei sicuro di voler eliminare questa spesa?");

    if (!confirmed) return; // Se annulla, esce dalla funzione

    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    renderExpenses();
}

/* 🔹 8. FUNZIONE MODIFICA SPESA */
function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;

    descriptionInput.value = expense.description;
    amountInput.value = expense.amount;
    categorySelect.value = expense.category;
    dateInput.value = expense.date;
    editingId = id;
}

/* 🔹 9. LOCAL STORAGE */
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

/* 🔹 10. FUNZIONE PER CALCOLARE LE SPESE PER CATEGORIA */
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

/* 🔹 11. FUNZIONE PER DISEGANRE IL GRAFICO */
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

/* 🔹 12. FUNZIONE PER FILTRARE LE SPESE */
function getFilteredExpenses() {
    const category = filterCategory.value;
    const month = filterMonth.value; // Formato YYYY-MM

    // Nessuna categoria selezionata
    if(!category) return [];
    return expenses.filter(exp => {

        // Filtro per categoria
        const matchCategory = category === "all" || exp.category === category;

        // Filtro mese
        const matchMonth = month === "" || exp.date.startsWith(month);

        return matchCategory && matchMonth;
    });
}

/* 🔹 13. FUNZIONE CHE AGGREGA PER CATEGORIA SULLE SPESE FILTRATE */
function getChartData() {
    const filtered = getFilteredExpenses();
    const totals = {};

    filtered.forEach(exp => {
        totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return totals;
}

/* 🔹 14. FUNZIONE RESET FILTRI */
function resetFilters() {
    // Reset valori categorie
    filterCategory.value = "";

    // Reset valori mese <input type="month"> non accetta "all"
    filterMonth.value = "";

    // ri-render completo
    renderExpenses();
    
}

/* 🔹 15. FUNZIONE DISABILITA FILTRI */
function updateResetButtonState() {
    resetFiltersBtn.disabled = filterCategory.value === "all";
}

/* 🔹 16. EVENTI */
addBtn.addEventListener("click", addExpense);

filterCategory.addEventListener("change", renderExpenses);
filterMonth.addEventListener("change", renderExpenses);
resetFiltersBtn.addEventListener("click", resetFilters);

// Carica all'avvio
loadExpenses();
dateInput.value = getTodayDate(); // Imposta la data di oggi come default