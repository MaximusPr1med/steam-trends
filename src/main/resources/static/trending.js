document.addEventListener("DOMContentLoaded", function () {
    fetchTrendingGames();
});

function fetchTrendingGames() {
    console.log("Fetching all trending games...");

    fetch('http://localhost:8087/api/games/trending')
        .then(response => response.json())
        .then(trendingData => {
            console.log("Trending Games Data:", trendingData);

            if (!trendingData || trendingData.length === 0) {
                console.warn("No trending games available.");
                return;
            }

            populateTrendingTable(trendingData);
        })
        .catch(error => {
            console.error("Error fetching trending games:", error);
        });
}

function populateTrendingTable(trendingData) {
    const tableBody = document.getElementById("trendingData");
    tableBody.innerHTML = "";

    trendingData.forEach((game, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${game.gameTitle}</td>
            <td>${game.currentPlayers}</td>
            <td>${game.peakPlayers}</td>
            <td>${game.hoursPlayed}</td>
            <td><div class="player-trend" id="trend-container-${game.gameId}"></div></td>
        `;
        tableBody.appendChild(row);
        fetchGameHistory(game.gameId, `trend-container-${game.gameId}`);
    });
}

function fetchGameHistory(gameId, containerId) {
    console.log(`Fetching history for Game ID: ${gameId}`);
    
    fetch(`http://localhost:8087/api/games/history?gameId=${gameId}`)
        .then(response => response.json())
        .then(historyData => {
            if (!historyData || historyData.length === 0) {
                console.warn(`No history data found for Game ID: ${gameId}`);
                return;
            }

            let container = document.getElementById(containerId);
            if (!container) {
                console.error(`Error: Trend container '${containerId}' not found`);
                return;
            }

            let canvas = document.createElement("canvas");
            container.innerHTML = "";
            container.appendChild(canvas);

            renderMiniGraph(historyData, canvas);
        })
        .catch(error => {
            console.error(`Error fetching game history for Game ID ${gameId}:`, error);
        });
}

function renderMiniGraph(historyData, canvas) {
    if (!canvas) {
        console.error("Canvas element is missing for rendering the graph.");
        return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = 260;
    canvas.height = 90;

    const labels = historyData.map(entry => new Date(entry.timestamp).toLocaleTimeString());
    const data = historyData.map(entry => entry.currentPlayers);

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Player Trend",
                data: data,
                borderColor: "#4CAF50",
                borderWidth: 4,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 10,
                tension: 0.3
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: { 
                x: { display: false }, 
                y: { display: false } 
            },
            plugins: { 
                legend: { display: false } 
            }
        }
    });

    canvas.style.margin = "auto";
}
