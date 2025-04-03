document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get("gameId");

    if (!gameId) {
        alert("Game ID not provided!");
        return;
    }

    fetchGameDetails(gameId);

    document.getElementById("btn-1h").addEventListener("click", () => updateChart(gameId, "1h"));
    document.getElementById("btn-24h").addEventListener("click", () => updateChart(gameId, "24h"));
    document.getElementById("btn-48h").addEventListener("click", () => updateChart(gameId, "48h"));
    document.getElementById("btn-week").addEventListener("click", () => updateChart(gameId, "week"));
    document.getElementById("btn-month").addEventListener("click", () => updateChart(gameId, "month"));
    document.getElementById("btn-all").addEventListener("click", () => updateChart(gameId, "all"));
});

function fetchGameDetails(gameId) {
    fetch(`http://localhost:8087/api/games/details?gameId=${gameId}`)
        .then(response => response.json())
        .then(gameData => {
            if (!gameData) {
                alert("Game data not found!");
                return;
            }

            document.getElementById("gameTitle").textContent = gameData.gameTitle;
            document.getElementById("currentPlayers").textContent = gameData.currentPlayers.toLocaleString();
            document.getElementById("peakPlayers").textContent = gameData.peakPlayers.toLocaleString();
            document.getElementById("hoursPlayed").textContent = gameData.hoursPlayed.toLocaleString();

            fetchGameHistory(gameId, "24h"); 
        })
        .catch(error => {
            console.error("Error fetching game details:", error);
            alert("Error retrieving game details.");
        });
}

function fetchGameHistory(gameId, timeRange) {
    let url = `http://localhost:8087/api/games/history?gameId=${gameId}&timeRange=${timeRange}`;

    fetch(url)
        .then(response => response.json())
        .then(historyData => {
            if (!historyData || historyData.length === 0) {
                alert("No history data found for this game.");
                return;
            }

            renderLargeGraph(historyData);
        })
        .catch(error => {
            console.error(`Error fetching game history for Game ID ${gameId}:`, error);
        });
}

function renderLargeGraph(historyData) {
    const ctx = document.getElementById("gameChart").getContext("2d");

    const labels = historyData.map(entry => {
        const date = new Date(entry.timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`; // Shows both day and time
    });

    const data = historyData.map(entry => entry.currentPlayers);

    if (window.gameChartInstance) {
        window.gameChartInstance.destroy();
    }

    window.gameChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Player Trend",
                data: data,
                borderColor: "#007BFF",
                borderWidth: 3,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHitRadius: 10,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                x: { 
                    display: true, 
                    title: { display: true, text: "Time" } 
                }, 
                y: { 
                    display: true, 
                    title: { display: true, text: "Players" } 
                } 
            },
            plugins: { 
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const index = tooltipItem.dataIndex;
                            const playerCount = tooltipItem.raw.toLocaleString();
                            return `Players: ${playerCount}`;
                        },
                        title: function (tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            return labels[index]; 
                        }
                    }
                }
            }
        }
    });
}

function updateChart(gameId, timeRange) {
    fetchGameHistory(gameId, timeRange);
}
