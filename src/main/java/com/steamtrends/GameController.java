package com.steamtrends.controller;

import com.steamtrends.model.Game;
import com.steamtrends.model.GameHistory;
import com.steamtrends.repository.GameRepository;
import com.steamtrends.repository.GameHistoryRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/games")
@CrossOrigin
public class GameController {
    
    private final GameRepository gameRepository;
    private final GameHistoryRepository gameHistoryRepository;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public GameController(GameRepository gameRepository, GameHistoryRepository gameHistoryRepository, JdbcTemplate jdbcTemplate) {
        this.gameRepository = gameRepository;
        this.gameHistoryRepository = gameHistoryRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/top10")
    public List<Game> getTop10Games() {
        return gameRepository.findTop10ByOrderByCurrentPlayersDesc();
    }

    @GetMapping("/top50")
    public List<Map<String, Object>> getTop50Games() {
        String sql = "SELECT * FROM games ORDER BY current_players DESC LIMIT 50";
        return jdbcTemplate.queryForList(sql);
    }

    @GetMapping("/trending")
    public List<Game> getTrendingGames() {
        return gameRepository.findAllByOrderByCurrentPlayersDesc(); 
    }

    @GetMapping("/details")
    public ResponseEntity<Game> getGameDetails(@RequestParam(name = "gameId") int gameId) {
        Optional<Game> game = gameRepository.findById(gameId);
        return game.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public List<GameHistory> getGameHistory(
            @RequestParam(name = "gameId") int gameId,
            @RequestParam(name = "timeRange", defaultValue = "24h") String timeRange) {
    
        LocalDateTime fromTime = LocalDateTime.now();
    
        switch (timeRange) {
            case "1h":
                fromTime = fromTime.minusHours(1);
                break;
            case "24h":
                fromTime = fromTime.minusHours(24);
                break;
            case "48h":
                fromTime = fromTime.minusHours(48);
                break;
            case "week":
                fromTime = fromTime.minusDays(7);
                break;
            case "month":
                fromTime = fromTime.minusDays(30);
                break;
            case "all":
                return gameHistoryRepository.findByGameIdOrderByTimestampAsc(gameId); // ✅ Returns full history
            default:
                fromTime = fromTime.minusHours(24); 
                break;
        }
    
        return gameHistoryRepository.findByGameIdAndTimestampAfterOrderByTimestampAsc(gameId, fromTime);
    }    
}
