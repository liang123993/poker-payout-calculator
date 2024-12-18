const leaderboardTable = document.getElementById('leaderboard_table');

// format currency to have the '-' sign outside of the $
function formatCurrency(amount) {
    const formatted = amount < 0 ? `-$${Math.abs(amount)}` : `$${amount}`;
    const className = amount < 0 ? 'loss' : amount > 0 ? 'profit' : 'neutral';
    return `<span class="${className}">${formatted}</span>`;
}

const playerStats = {};  // Initialize playerStats

// loading games from backend
db.collection('games')
    .get()
    
    .then(snapshot => {
        snapshot.forEach(doc => {
            const game = doc.data();
            game.players.forEach(player => {
                const name = player.name.toUpperCase();

                // intializes player with their stats if new player
                if (!playerStats[name]) {
                    playerStats[name] = {
                        name: name,
                        gamesPlayed: 0,
                        totalNet: 0,
                    };
                }

                playerStats[name].gamesPlayed++;
                playerStats[name].totalNet += player.net;
            })
        });
        const leaderboardData = Object.values(playerStats)
            .sort((a,b) => a.totalNet > b.totalNet ? -1 : 1); // DESCENDING ORDER RN 

        // updating leaderboard
        leaderboardData.forEach((player, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.gamesPlayed}</td>
                <td>${formatCurrency(player.totalNet)}</td>
            `;
            leaderboardTable.appendChild(row);
        });
    })
    .catch(error => {  
        console.error("Error loading games:", error); 
        alert("Error loading leaderboard data");      
    });
