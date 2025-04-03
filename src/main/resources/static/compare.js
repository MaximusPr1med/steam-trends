document.addEventListener("DOMContentLoaded", function () {
    const MAX_GAMES = 5;
    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

    const gameSelectContainer = document.getElementById("gameSelectContainer");
    const addGameBtn = document.getElementById("addGameBtn");
    const compareBtn = document.getElementById("compareBtn");

    let selectedRange = "24h";
    let gameList = [];

    fetch("http://localhost:8087/api/games/top50")
        .then(res => res.json())
        .then(games => {
            gameList = games;
            for (let i = 0; i < 2; i++) {
                addGameDropdown(i);
            }
        });

    function addGameDropdown(index) {
        const wrapper = document.createElement("div");
        wrapper.className = "dropdown-wrapper";
        wrapper.dataset.index = index;

        const label = document.createElement("label");
        label.textContent = `Game ${index + 1}`;
        label.className = "game-label";

        const select = document.createElement("select");
        select.classList.add("game-select");
        select.innerHTML = `<option disabled selected>Select Game</option>`;
        populateDropdown(select, getSelectedGameIds(), null);

        select.addEventListener("change", updateAllDropdowns);

        wrapper.appendChild(label);
        wrapper.appendChild(select);

        if (index >= 2) {
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.className = "remove-btn";
            removeBtn.onclick = () => {
                wrapper.remove();
                updateGameIndexes();
                toggleAddButton();
                updateAllDropdowns();
                autoUpdateChart();
            };
            wrapper.appendChild(removeBtn);
        }

        gameSelectContainer.appendChild(wrapper);
        toggleAddButton();
    }

    function populateDropdown(select, selectedIds, currentValue) {
        select.innerHTML = `<option disabled ${!currentValue ? "selected" : ""}>Select Game</option>`;

        gameList.forEach(game => {
            const gameId = game.id || game.game_id;
            const isSelectedElsewhere = selectedIds.includes(gameId) && gameId !== currentValue;

            if (!isSelectedElsewhere) {
                const option = document.createElement("option");
                option.value = gameId;
                option.textContent = game.game_title;
                if (gameId === currentValue) {
                    option.selected = true;
                }
                select.appendChild(option);
            }
        });
    }

    function updateAllDropdowns() {
        const selectedIds = getSelectedGameIds();
        const selects = document.querySelectorAll(".game-select");

        selects.forEach(select => {
            const currentValue = parseInt(select.value);
            populateDropdown(select, selectedIds, currentValue);
        });
    }

    function toggleAddButton() {
        const current = document.querySelectorAll(".game-select").length;
        addGameBtn.style.display = current >= MAX_GAMES ? "none" : "inline-block";
    }

    function updateGameIndexes() {
        document.querySelectorAll(".dropdown-wrapper").forEach((wrapper, index) => {
            const label = wrapper.querySelector("label");
            label.textContent = `Game ${index + 1}`;
            wrapper.dataset.index = index;
        });
    }

    function getSelectedGameIds() {
        const ids = [];
        document.querySelectorAll(".game-select").forEach(select => {
            const id = parseInt(select.value);
            if (!isNaN(id)) ids.push(id);
        });
        return ids;
    }

    function autoUpdateChart() {
        const ids = getSelectedGameIds();
        if (ids.length >= 2) {
            fetchComparisonData();
        }
    }

    addGameBtn.addEventListener("click", () => {
        const current = document.querySelectorAll(".game-select").length;
        if (current < MAX_GAMES) {
            addGameDropdown(current);
            updateAllDropdowns();
        }
    });

    document.querySelectorAll(".timeframe-buttons button").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".timeframe-buttons button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedRange = btn.getAttribute("data-range");

            autoUpdateChart();
        });
    });

    compareBtn.addEventListener("click", () => {
        const ids = getSelectedGameIds();
        if (ids.length < 2) {
            alert("Please select at least 2 different games.");
            return;
        }
        fetchComparisonData();
    });

    function fetchComparisonData() {
        const ids = getSelectedGameIds();

        const requests = ids.map(id =>
            fetch(`http://localhost:8087/api/games/history?gameId=${id}&timeRange=${selectedRange}`)
                .then(res => res.json())
                .then(data => ({ id, data }))
        );

        Promise.all(requests)
            .then(results => {
                if (results.some(r => !r.data || r.data.length === 0)) {
                    alert("Some selected games returned no data.");
                    return;
                }

                const labels = results[0].data.map(entry => {
                    const date = new Date(entry.timestamp);
                    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                });

                const datasets = results.map((result, index) => {
                    const game = gameList.find(g => parseInt(g.id || g.game_id) === result.id);
                    const title = game?.game_title || `Game ${index + 1}`;

                    return {
                        label: title,
                        data: result.data.map(entry => entry.currentPlayers),
                        borderColor: COLORS[index],
                        backgroundColor: COLORS[index],
                        borderWidth: 3,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 0,
                        pointHitRadius: 10,
                        pointHoverRadius: 4
                    };
                });

                drawChart(labels, datasets);
            })
            .catch(err => {
                console.error("❌ Error fetching game data:", err);
                alert("Something went wrong loading game data.");
            });
    }

    function drawChart(labels, datasets) {
        const ctx = document.getElementById("compareChart").getContext("2d");
        if (window.compareChartInstance) window.compareChartInstance.destroy();

        window.compareChartInstance = new Chart(ctx, {
            type: "line",
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: items => labels[items[0].dataIndex],
                            label: item => `${item.dataset.label}: ${item.raw.toLocaleString()} players`
                        }
                    }
                },
                scales: {
                    x: { title: { display: true, text: "Time" } },
                    y: { title: { display: true, text: "Players" }, beginAtZero: true }
                }
            }
        });
    }
});