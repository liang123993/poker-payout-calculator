// add player button
const playersTableBody = document.getElementById('players_table');
const addPlayersBtn = document.querySelector(".button_add");
const calculateBtn = document.querySelector(".button_calculate");

//------------------------------------add button------------------------------------
function createNewRow() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td data-label="Player Name">
            <input type="text" class="table_input" placeholder="Enter name">
        </td>
        <td data-label="Buy-in">
            <input type="number" class="table_input" placeholder="Enter Buy-in">
        </td>
        <td data-label="Cashout">
            <input type="number" class="table_input" placeholder="Enter Cashout">
        </td>
        <td data-label="Net">
            <span class="profit_display">$0</span>
        </td>
        <td data-label="Actions">
            <button class="delete-btn">Delete</button>
        </td>
    `;

    const deleteBtn = newRow.querySelector(".delete-btn");
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
function formatCurrency(amount) {
    return amount < 0 ? `-$${Math.abs(amount)}` : `$${amount}`;
}

function showCalculationModal(transfers) {
    const rows = playersTableBody.querySelectorAll('tr');
    const playerData = Array.from(rows).map(row => ({
        name: row.querySelector('input[placeholder="Enter name"]').value,
        buyin: row.querySelector('input[placeholder="Enter Buy-in"]').value,
        cashout: row.querySelector('input[placeholder="Enter Cashout"]').value,
        net: Number(row.querySelector('.profit_display').textContent)
    }));

    // Sort players by net amount (highest to lowest)
    playerData.sort((a, b) => b.net - a.net);

    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal_content">
            <span class="modal_close">&times;</span>
            
            <div class="modal_title_input">
                <input type="text" 
                       placeholder="Enter game title" 
                       class="game_title_input"
                       required>
            </div>

            <table class="table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Buy-in</th>
                        <th>Cashout</th>
                        <th>Net</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${playerData.map((player, index) => {
                        const playerTransfers = transfers.filter(t => t.from === player.name);
                        const actions = playerTransfers.length > 0 
                            ? playerTransfers.map(t => `Pay ${t.to} $${t.amount}`).join('<br>')
                            : '-';
                        
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${player.name}</td>
                                <td>$${player.buyin}</td>
                                <td>$${player.cashout}</td>
                                <td>${formatCurrency(player.net)}</td>
                                <td>${actions}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <button class="button_submit">Submit</button>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.modal_close');
    closeBtn.onclick = () => modal.remove();
    
    // ---------------submit button----------------
    const submitBtn = modal.querySelector('.button_submit');
    submitBtn.onclick = async () => {
        const titleInput = modal.querySelector('.game_title_input');
        if (!titleInput.value.trim()) {
            alert('Please enter a game title');
            return;
        }

        try {
            const gameData = {
                title: titleInput.value.trim(),
                date: firebase.firestore.Timestamp.now(),
                players: playerData,
                transfers: transfers,
                totalAmount: playerData.reduce((sum, player) => sum + Number(player.buyin), 0),
                playerCount: playerData.length
            };
            // Add to Firestore
            const docRef = await db.collection('games').add(gameData);

            alert('Game saved successfully!');
 
        } catch (error) {
            console.error("Error saving game:", error);
            alert("Error saving game: " + error.message);
        }
    };
}

