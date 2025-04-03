🎮 Steam Trends

Steam Trends is a full-stack web application that allows users to view real-time and historical Steam game data. Users can compare up to 5 games with interactive line graphs, explore trends across multiple timeframes, and view detailed stats including current, peak, and total hours played.

---

🚀 Features

- 🔥 **Trending Dashboard** – Top games sorted by current players
- 📈 **Game Comparison** – Compare up to 5 games with smooth graph visualization
- 🧠 **Smart Dropdowns** – Only unique selections per dropdown, auto-disabled duplicates
- 🕒 **Flexible Time Ranges** – 1h, 24h, 48h, 1 week, 1 month, or all time
- 🎨 **Clean & Responsive UI** – Styled to match Steam’s aesthetic

---

🛠️ Tech Stack

**Frontend**
- HTML, CSS, JavaScript
- Chart.js (interactive graphs)

**Backend**
- Java 20 (Spring Boot)
- REST API
- MySQL (hosted on AWS RDS)

**Deployment**
- Docker (containerization)
- AWS EC2 (backend hosting)
- AWS RDS (database)

---

Backend Setup

**Java 20, Maven, and MySQL required**

- Create a database:
- CREATE DATABASE steam_trends;

- Update your DB credentials in:
- src/main/resources/application.properties

- Run the app:
- mvn clean install
- java -jar target/steam-trends.jar

--- 

Frontend

- Open index.html

📄 Pages

- **Home Games Page**
- **Trending Games Page**
- **Compare Games Page**

---

📊 API Endpoints

Endpoint	                        Method	      Description
/api/games/top50	                GET	          Top 50 games by current players
/api/games/details?gameId=XXX	    GET	          Game details for given ID
/api/games/history	              GET	          Historical data for a game
└ ?gameId=XXX&timeRange=24h		                  Valid ranges: 1h, 24h, 48h, week, month, all

---

💡 Features That Make This App Stand Out

- 🧩 Interactive multi-select dropdowns
- 🎨 Custom line colors per game
- 🕶️ Smooth animations with Chart.js
- ➕ Add up to 5 games with one click
