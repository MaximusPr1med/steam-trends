package com.steamtrends.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "game_history")
public class GameHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id", nullable = false, unique = true)
    private Long historyId;

    @Column(name = "game_id", nullable = false)
    private int gameId;

    @Column(nullable = false)
    private int currentPlayers;

    @Column(nullable = false)
    private Timestamp timestamp;

    // Getters and Setters
    public Long getHistoryId() { return historyId; }
    public void setHistoryId(Long historyId) { this.historyId = historyId; }

    public int getGameId() { return gameId; }
    public void setGameId(int gameId) { this.gameId = gameId; }

    public int getCurrentPlayers() { return currentPlayers; }
    public void setCurrentPlayers(int currentPlayers) { this.currentPlayers = currentPlayers; }

    public Timestamp getTimestamp() { return timestamp; }
    public void setTimestamp(Timestamp timestamp) { this.timestamp = timestamp; }
}
