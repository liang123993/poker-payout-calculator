const leaderboardTable = document.getElementById('leaderboard_table');

function formatCurrency(amount) {
    const formatted = amount < 0 ? `-$${Math.abs.amount}` : `$${amount}`;
    const className = amount < 0 ? 'loss' : amount > 0 ? 'profit' : 'neutral';
   return `<span class="${className}">${formatted}</span>`;
}