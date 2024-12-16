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

    return newRow;
}

addPlayersBtn.addEventListener("click", () => {
    playersTableBody.appendChild(createNewRow());
});