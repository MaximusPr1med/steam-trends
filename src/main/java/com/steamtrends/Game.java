package com.steamtrends.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "games")
public class Game {
    @Id
    private int gameId;

    @Column(nullable = false)
    private String gameTitle;

    @Column(nullable = false)
    private int currentPlayers;

    @Column(nullable = false)
    private int peakPlayers;

    @Column(nullable = false)
    private int hoursPlayed;

    @Column(nullable = false)
    private Timestamp lastUpdated;

    // Getters and Setters
    public int getGameId() { return gameId; }
    public void setGameId(int gameId) { this.gameId = gameId; }

    public String getGameTitle() { return gameTitle; }
    public void setGameTitle(String gameTitle) { this.gameTitle = gameTitle; }

    public int getCurrentPlayers() { return currentPlayers; }
    public void setCurrentPlayers(int currentPlayers) { this.currentPlayers = currentPlayers; }

    public int getPeakPlayers() { return peakPlayers; }
    public void setPeakPlayers(int peakPlayers) { this.peakPlayers = peakPlayers; }

    public int getHoursPlayed() { return hoursPlayed; }
    public void setHoursPlayed(int hoursPlayed) { this.hoursPlayed = hoursPlayed; }

    public Timestamp getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Timestamp lastUpdated) { this.lastUpdated = lastUpdated; }
}
