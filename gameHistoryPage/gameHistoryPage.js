document.addEventListener('DOMContentLoaded', () => {
    const historyTable = document.getElementById('history_table');

    // load games from Firebase
    db.collection('games')
        .orderBy('date', 'desc')  // recent first
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const game = doc.data();
                const row = document.createElement('tr');
                
                // format date
                const date = game.date.toDate();
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                row.innerHTML = `
                    <td>${game.title}</td>
                    <td>${formattedDate}</td>
                    <td>${game.playerCount} players</td>
                    <td>$${game.totalAmount}</td>
                    <td>
                        <button class="action_link" onclick="viewGame('${doc.id}')">View</button>
                        <button class="action_link delete_btn" onclick="deleteGame('${doc.id}', this)">Delete</button>
                    </td>
                `;

                historyTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading games:", error);
            alert("Error loading game history");
        });
});

//------------------------------view game modal -----------------------------------
function formatCurrency(amount) {
    return amount < 0 ? `-$${Math.abs(amount)}` : `$${amount}`;
}

function viewGame(gameId) {
    db.collection('games').doc(gameId).get().then(doc => {
        if (doc.exists) {
            const game = doc.data();
            
            const modal = document.createElement('div');
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal_content">
                    <span class="modal_close">&times;</span>
                    <h3 class="modal_title">${game.title}</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player Name</th>
                                <th>Buy-in</th>
                                <th>Cashout</th>
                                <th>Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${game.players.map((player, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${player.name}</td>
                                    <td>$${player.buyin}</td>
                                    <td>$${player.cashout}</td>
                                    <td>${formatCurrency(player.net)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('.modal_close');
            closeBtn.onclick = () => modal.remove();
        }
    });
}

// ----------------- delete game button -------------------
async function deleteGame(gameId, buttonElement) {
    if (confirm('Are you sure you want to delete this game? This cannot be undone.')) {
        try {
            await db.collection('games').doc(gameId).delete();
            
            buttonElement.closest('tr').remove();
        } catch (error) {
            console.error("Error deleting game:", error);
            alert("Error deleting game");
        }
    }
}