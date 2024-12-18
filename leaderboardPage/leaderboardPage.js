const leaderboardTable = document.getElementById('leaderboard_table');

// format currency to have the '-' sign outside of the $
function formatCurrency(amount) {
    const formatted = amount < 0 ? `-$${Math.abs.amount}` : `$${amount}`;
    const className = amount < 0 ? 'loss' : amount > 0 ? 'profit' : 'neutral';
   return `<span class="${className}">${formatted}</span>`;
}

// loading games from backend
db.collection('games')
    .get()
    
    .then(snapshot => {
        const playerStats = {}
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

                // updates these every time we see the player in game history
               playerStats[name].gamesPlayed++;
               playerStats[name].totalNet += player.net;
            })
        });
        // test
       console.log('Player Stats:', playerStats);
    })
    .catch(error => {  
        console.error("Error loading games:", error); 
        alert("Error loading leaderboard data");      
    });
