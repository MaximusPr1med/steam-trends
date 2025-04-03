document.addEventListener("DOMContentLoaded", function () {
    const isTrendingPage = window.location.pathname.includes("trending.html");

    if (isTrendingPage) {
        fetchAllGames();
    } else {
        fetchTop10Games();
        fetchTrendingGames();
    }
});

function fetchTop10Games() {
    console.log("Fetching Top 10 games data...");

    fetch('http://localhost:8087/api/games/top10')
        .then(response => response.json())
        .then(gamesData => {
            console.log("Top 10 Games Data:", gamesData);

            if (!gamesData || gamesData.length === 0) {
                console.warn("No games data available.");
                alert("No top 10 game data found.");
                return;
            }

            populateGamesTable(gamesData);
        })
        .catch(error => {
            console.error("Error fetching Top 10 games data:", error);
            alert("Error retrieving data. Check console.");
        });
}

function fetchAllGames() {
    console.log("Fetching all trending games...");

    fetch('http://localhost:8087/api/games/trending')
        .then(response => response.json())
        .then(allGamesData => {
            console.log("All Games Data:", allGamesData);

            if (!allGamesData || allGamesData.length === 0) {
                console.warn("No games available.");
                alert("No game data found.");
                return;
            }

            populateAllGamesTable(allGamesData);
        })
        .catch(error => {
            console.error("Error fetching all games:", error);
            alert("Error retrieving data. Check console.");
        });
}

function fetchTrendingGames() {
    console.log("Fetching Trending games data...");

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
            console.error("Error fetching Trending games data:", error);
        });
}

function populateGamesTable(gamesData) {
    const tableBody = document.getElementById("gameData");
    tableBody.innerHTML = "";

    gamesData.forEach((game, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${game.gameTitle}</td>
            <td>${game.currentPlayers.toLocaleString()}</td>
            <td>${game.peakPlayers.toLocaleString()}</td>
            <td>${game.hoursPlayed.toLocaleString()}</td>
            <td><div class="player-trend" id="trend-container-${game.gameId}"></div></td>
        `;

        row.onclick = () => {
            window.location.href = `game.html?gameId=${game.gameId}`;
        };

        row.style.cursor = "pointer";
        tableBody.appendChild(row);
        fetchGameHistory(game.gameId, `trend-container-${game.gameId}`);
    });
}

function populateAllGamesTable(allGamesData) {
    const tableBody = document.getElementById("allGamesData");
    tableBody.innerHTML = "";

    allGamesData.forEach((game, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${game.gameTitle}</td>
            <td>${game.currentPlayers.toLocaleString()}</td>
            <td>${game.peakPlayers.toLocaleString()}</td>
            <td>${game.hoursPlayed.toLocaleString()}</td>
            <td><div class="player-trend" id="trend-container-${game.gameId}"></div></td>
        `;

        row.onclick = () => {
            window.location.href = `game.html?gameId=${game.gameId}`;
        };

        row.style.cursor = "pointer"; 
        tableBody.appendChild(row);
        fetchGameHistory(game.gameId, `trend-container-${game.gameId}`);
    });
}


function populateTrendingTable(trendingData) {
    const tableBody = document.getElementById("trendingData");
    tableBody.innerHTML = "";

    trendingData.forEach(game => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${game.gameTitle}</td>
            <td style="color: green;">+${game.percentageChange.toFixed(2)}%</td>
            <td><div class="player-trend" id="trend-container-${game.gameId}"></div></td>
            <td>${game.currentPlayers.toLocaleString()}</td>
        `;

        row.onclick = () => {
            window.location.href = `game.html?gameId=${game.gameId}`;
        };

        row.style.cursor = "pointer";
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

    canvas.width = 280; 
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
                borderColor: "#007BFF",
                borderWidth: 3,  
                fill: false,
                pointRadius: 0,
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
