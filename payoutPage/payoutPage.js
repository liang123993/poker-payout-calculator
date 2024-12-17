// add player button
const playersTableBody = document.getElementById('players_table');
const addPlayersBtn = document.querySelector(".button_add");
const calculateBtn = document.querySelector(".button_calculate");

//------------------------------------add button------------------------------------
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

// ------------------------------------payout calculation------------------------------------
function calculatePayouts() {
    const rows = playersTableBody.querySelectorAll('tr');
    const losers = []; 
    const winners = [];
    let totalNet = 0;

    // if net > 0, winners.push, is net < 0 losers.push
    for (let row of rows) {
        const name = row.querySelector('input[placeholder="Enter name"]').value;
        const net = Number(row.querySelector(".profit_display").textContent);
        
        if (!name.trim()) {
            alert("All players must have names");
            return;
        }

        totalNet += net;

        if (net < 0) {
            losers.push({name, amount: Math.abs(net)});
        } else if (net > 0) {
            winners.push({name, amount: Math.abs(net)});
        }
    }
    if (Math.abs(totalNet) !== 0) {
        alert("Error: Total net amount should be zero. Current total: $" + totalNet);
        return;
    }
    
    // sort the arrays by size
    winners.sort((a,b) => a.amount > b.amount ? -1:1);
    losers.sort((a,b) => a.amount > b.amount ? -1:1);

    //transfers
    const transfers = [];
    let loserIndex = 0;
    let winnerIndex = 0;

    while (loserIndex < losers.length && winnerIndex < winners.length) {
        const debtor = losers[loserIndex];
        const creditor = winners[winnerIndex];

        const transferAmount = Math.min(debtor.amount, creditor.amount);
        
        transfers.push({
            from: debtor.name,
            to: creditor.name,
            amount: transferAmount
        });

        debtor.amount -= transferAmount;
        creditor.amount -= transferAmount;

        if (debtor.amount === 0) loserIndex++;
        if (creditor.amount === 0) winnerIndex++;
    }
    showCalculationModal(transfers);
    return transfers;
}

calculateBtn.addEventListener("click", calculatePayouts);

// ------------------------------------transfer results modal------------------------------------
function showCalculationModal(transfers) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal_content">
            <span class="modal_close">&times;</span>
            <table class="table">
                <thead>
                    <tr>
                        <th>Player Name</th>
                        <th>Net Gain/Loss</th>
                        <th>Payment Details</th>
                        <th>Actions</th>
                        <th>Settled?</th>
                    </tr>
                </thead>
                <tbody>
                    ${transfers.map(transfer => `
                        <tr>
                            <td>${transfer.from}</td>
                            <td>-$${transfer.amount}</td>
                            <td>Pay ${transfer.to}</td>
                            <td>${`Pay ${transfer.to} $${transfer.amount}`}</td>
                            <td><input type="checkbox" class="settled_checkbox"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button class="button_submit">Submit</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.modal_close');
    closeBtn.onclick = () => modal.remove();
}
