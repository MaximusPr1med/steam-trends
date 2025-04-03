package com.steamtrends;

import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SteamDataFetcher {
    private static final Logger logger = LoggerFactory.getLogger(SteamDataFetcher.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String API_KEY = System.getenv("STEAM_API_KEY");
    private static final String PLAYER_COUNT_API_URL = "https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/";

    private static final Map<Integer, String> gameTitles = new HashMap<>();

    static {
        gameTitles.put(730, "Counter-Strike 2");
        gameTitles.put(570, "Dota 2");
        gameTitles.put(440, "Team Fortress 2");
        gameTitles.put(578080, "PUBG: Battlegrounds");
        gameTitles.put(252490, "Rust");
        gameTitles.put(359550, "Tom Clancy's Rainbow Six Siege");
        gameTitles.put(218620, "PAYDAY 2");
        gameTitles.put(304930, "Unturned");
        gameTitles.put(1091500, "Cyberpunk 2077");
        gameTitles.put(236850, "Europa Universalis IV");
        gameTitles.put(8930, "Sid Meier's Civilization V");
        gameTitles.put(394360, "Hearts of Iron IV");
        gameTitles.put(1085660, "Destiny 2");
        gameTitles.put(2050650, "Palworld");
        gameTitles.put(281990, "Stellaris");
        gameTitles.put(1172470, "Apex Legends");
        gameTitles.put(1328670, "Battlefield 2042");
        gameTitles.put(1245620, "Persona 5 Royal");
        gameTitles.put(1817070, "FIFA 23");
        gameTitles.put(1621690, "Elden Ring");
        gameTitles.put(200210, "Garry's Mod");
        gameTitles.put(1938090, "Hogwarts Legacy");
        gameTitles.put(289070, "Civilization VI");
        gameTitles.put(105600, "Terraria");
        gameTitles.put(322330, "Don't Starve Together");
        gameTitles.put(700330, "Black Mesa");
        gameTitles.put(233860, "Kenshi");
        gameTitles.put(381210, "Dead by Daylight");
        gameTitles.put(275850, "No Man's Sky");
        gameTitles.put(945360, "Among Us");
        gameTitles.put(221100, "DayZ");
        gameTitles.put(211820, "Starbound");
        gameTitles.put(739630, "Phasmophobia");
        gameTitles.put(1517290, "God of War");
        gameTitles.put(271590, "GTA V");
        gameTitles.put(1238810, "Persona 3 Reload");
        gameTitles.put(550, "Left 4 Dead 2");
        gameTitles.put(282140, "Outer Wilds");
        gameTitles.put(1196590, "The Last of Us Part I");
        gameTitles.put(1086940, "Baldur's Gate 3");
        gameTitles.put(1293830, "It Takes Two");
        gameTitles.put(1551360, "V Rising");
        gameTitles.put(383120, "Empyrion - Galactic Survival");
        gameTitles.put(1244460, "Dinkum");
        gameTitles.put(1222140, "Enshrouded");
        gameTitles.put(2221490, "Helldivers 2");
        gameTitles.put(1217060, "BattleBit Remastered");
        gameTitles.put(372000, "The Forest");
        gameTitles.put(1426210, "Dwarf Fortress");
        gameTitles.put(526870, "The Planet Crafter");
        gameTitles.put(3241660, "R.E.P.O.");
        gameTitles.put(582010, "Monster Hunter: World");
        gameTitles.put(2767030, "Marvel Rivals");
    }

    private List<Integer> appIds = new ArrayList<>(gameTitles.keySet());

    @PostConstruct
    public void init() {
        logger.info("🚀 [INIT] Fetching game data on startup...");
        fetchAndUpdateGameData();
    }

    @Scheduled(fixedRate = 600000) // 10 minutes
    public void fetchAndUpdateGameData() {
        logger.info("⏳ [FETCH] Fetching updated Steam game data...");

        for (int appId : appIds) {
            try {
                int currentPlayers = fetchCurrentPlayers(appId);
                int peakPlayers = getPeakPlayers(appId, currentPlayers);
                int hoursPlayed = getHoursPlayed(appId, currentPlayers);

                if (currentPlayers > 0) {
                    saveGameData(appId, gameTitles.get(appId), currentPlayers, peakPlayers, hoursPlayed);
                    saveGameHistory(appId, currentPlayers);
                }
            } catch (Exception e) {
                logger.error("❌ [ERROR] Fetching data failed for Game ID {}: {}", appId, e.getMessage());
            }
        }
    }

    private int fetchCurrentPlayers(int appId) {
        try {
            String url = PLAYER_COUNT_API_URL + "?appid=" + appId + "&key=" + API_KEY;
            String result = restTemplate.getForObject(url, String.class);
            JSONObject jsonResponse = new JSONObject(result);

            int playerCount = jsonResponse.getJSONObject("response").optInt("player_count", 0);
            return playerCount;
        } catch (Exception e) {
            return 0;
        }
    }

    private int getPeakPlayers(int appId, int currentPlayers) {
        try {
            String sql = "SELECT peak_players FROM games WHERE game_id = ?";
            Integer peakPlayers = jdbcTemplate.queryForObject(sql, new Object[]{appId}, Integer.class);
            return (peakPlayers == null || currentPlayers > peakPlayers) ? currentPlayers : peakPlayers;
        } catch (Exception e) {
            return currentPlayers;
        }
    }

    private int getHoursPlayed(int appId, int currentPlayers) {
        try {
            String sql = "SELECT hours_played FROM games WHERE game_id = ?";
            Integer previousHours = jdbcTemplate.queryForObject(sql, new Object[]{appId}, Integer.class);
            if (previousHours == null) previousHours = 0;
            int additionalHours = (currentPlayers * 10) / 60;
            return previousHours + additionalHours;
        } catch (Exception e) {
            return 0;
        }
    }

    private void saveGameData(int appId, String gameTitle, int currentPlayers, int peakPlayers, int hoursPlayed) {
        try {
            String sql = "INSERT INTO games (game_id, game_title, current_players, peak_players, hours_played, last_updated) " +
                         "VALUES (?, ?, ?, ?, ?, ?) " +
                         "ON DUPLICATE KEY UPDATE game_title = ?, current_players = ?, peak_players = ?, hours_played = ?, last_updated = ?";

            jdbcTemplate.update(sql, appId, gameTitle, currentPlayers, peakPlayers, hoursPlayed, new Timestamp(System.currentTimeMillis()),
                    gameTitle, currentPlayers, peakPlayers, hoursPlayed, new Timestamp(System.currentTimeMillis()));

        } catch (Exception e) {
            logger.error("❌ [ERROR] Failed to save game data for {}: {}", gameTitle, e.getMessage());
        }
    }

    private void saveGameHistory(int appId, int currentPlayers) {
        try {
            String historySql = "INSERT INTO game_history (game_id, timestamp, current_players) VALUES (?, ?, ?)";
            jdbcTemplate.update(historySql, appId, new Timestamp(System.currentTimeMillis()), currentPlayers);
        } catch (Exception e) {
            logger.error("❌ [ERROR] Failed to save game history for Game ID {}: {}", appId, e.getMessage());
        }
    }

    public List<Map<String, Object>> getTop10Games() {
        String sql = "SELECT * FROM games ORDER BY current_players DESC LIMIT 10";
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getTop50Games() {
        String sql = "SELECT * FROM games ORDER BY current_players DESC LIMIT 50";
        return jdbcTemplate.queryForList(sql);
    }
}
