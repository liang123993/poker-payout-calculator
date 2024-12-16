// add player button
const playersTableBody = document.getElementById('players_table');
const addPlayersBtn = document.querySelector(".button_add");

function createNewRow() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <input type="text" class="table_input" placeholder="Enter name">
        </td>
        <td>
            <input type="number" class="table_input" placeholder="Enter Buy-in">
        </td>
        <td>
            <input type="number" class="table_input" placeholder="Enter Cashout">
        </td>
        <td>
            <span class="profit_display">$0</span>
        </td>
        <td>
            <input type="text" class="table_input" placeholder="Payment Details">
        </td>
        <td>
            <button class="action_link">Delete</button>
        </td>
    `;

    const deleteBtn = newRow.querySelector(".action_link");
    deleteBtn.addEventListener("click", () => {
        newRow.remove();
    });

    // calculating net
    const buyinInput = newRow.querySelector('input[placeholder="Enter Buy-in"]');
    const cashoutInput = newRow.querySelector('input[placeholder="Enter Cashout"]');
    const profitDisplay = newRow.querySelector('.profit_display');

    function updateNet() {
        const buyin = Number(buyinInput.value) || 0;
        const cashout = Number(cashoutInput.value) || 0;
        const net = cashout - buyin;
        profitDisplay.textContent = `${net}`;
    }

    buyinInput.addEventListener("input", updateNet);
    cashoutInput.addEventListener("input", updateNet);

    return newRow;
}

addPlayersBtn.addEventListener("click", () => {
    playersTableBody.appendChild(createNewRow());
});

playersTableBody.appendChild(createNewRow());