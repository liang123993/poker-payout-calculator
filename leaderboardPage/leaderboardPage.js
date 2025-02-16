const leaderboardTable = document.getElementById('leaderboard_table');

function formatCurrency(amount) {
    const formatted = amount < 0 ? `-$${Math.abs(amount)}` : `$${amount}`;
    const className = amount < 0 ? 'loss' : amount > 0 ? 'profit' : 'neutral';
    return `<span class="${className}">${formatted}</span>`;
}

function calculateRankings(games) {
    const playerStats = new Map();
    
    games.forEach(game => {
        game.players.forEach(player => {
            // Ensure consistent case handling
            const name = player.name.trim().toUpperCase();
            
            if (!playerStats.has(name)) {
                playerStats.set(name, {
                    name: name,
                    gamesPlayed: 0,
                    totalNet: 0,
                    rankIcon: '-' // Everyone starts with dash
                });
            }
            
            const stats = playerStats.get(name);
            stats.gamesPlayed++;
            stats.totalNet += player.net;
        });
    });
    
    // Convert to array and sort by totalNet
    const rankedPlayers = Array.from(playerStats.values())
        .sort((a, b) => b.totalNet - a.totalNet)
        .map((player, index) => ({
            ...player,
            rank: index + 1
        }));
    
    return rankedPlayers;
}

// Loading games from backend
db.collection('games')
    .get()
    .then(snapshot => {
        if (snapshot.empty) {
            leaderboardTable.innerHTML = '<tr><td colspan="5">No games found</td></tr>';
            return;
        }

        const games = [];
        snapshot.forEach(doc => {
            games.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // For first game, everyone is NEW
        if (games.length === 1) {
            const rankings = calculateRankings(games);
            rankings.forEach(player => {
                player.rankIcon = '<span class="new-player">NEW</span>';
            });
            updateLeaderboard(rankings);
            return;
        }

        // Get previous rankings (before latest game)
        const previousRankings = calculateRankings(games.slice(0, -1));
        
        // Get current rankings (including latest game)
        const currentRankings = calculateRankings(games);

        // Create map of previous ranks for accurate lookup
        const previousRanksMap = new Map();
        previousRankings.forEach(player => {
            previousRanksMap.set(player.name, player.rank);
        });

        // Get players from latest game with consistent case
        const latestGame = games[games.length - 1];
        const playersInLatestGame = new Set(
            latestGame.players.map(p => p.name.trim().toUpperCase())
        );

        // Update rank icons only for players whose rank actually changed
        currentRankings.forEach(player => {
            const previousRank = previousRanksMap.get(player.name);
            
            if (previousRank === undefined && playersInLatestGame.has(player.name)) {
                // Only mark as NEW if they're in the latest game
                player.rankIcon = '<span class="new-player">NEW</span>';
            } else if (previousRank !== undefined && player.rank !== previousRank) {
                // Only update icon if rank actually changed
                if (player.rank < previousRank) {
                    player.rankIcon = '<img src="../images/green-arrow.png" alt="Rank Up" class="rank-icon">';
                } else if (player.rank > previousRank) {
                    player.rankIcon = '<img src="../images/red-arrow.png" alt="Rank Down" class="rank-icon">';
                }
            }
            // All other cases keep the default '-'
        });

        updateLeaderboard(currentRankings);
    })
    .catch(error => {
        console.error('Error loading games:', error);
        leaderboardTable.innerHTML = '<tr><td colspan="5">Error loading leaderboard data</td></tr>';
    });

function updateLeaderboard(rankings) {
    leaderboardTable.innerHTML = '';
    
    rankings.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.rankIcon}</td>
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.gamesPlayed}</td>
            <td>${formatCurrency(player.totalNet)}</td>
        `;
        leaderboardTable.appendChild(row);
    });
}

function getRankChangeIcon(rankChange) {
    if (rankChange === 'up') return '<img src="../images/green-arrow.png" alt="Rank Up">';
    if (rankChange === 'down') return '<img src="../images/red-arrow.png" alt="Rank Down">';
    return '-'; // No change or new player
}