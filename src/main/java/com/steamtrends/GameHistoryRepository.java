package com.steamtrends.repository;

import com.steamtrends.model.GameHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime; 
import java.util.List;

@Repository
public interface GameHistoryRepository extends JpaRepository<GameHistory, Integer> {
    List<GameHistory> findByGameIdOrderByTimestampAsc(int gameId);
    List<GameHistory> findByGameIdAndTimestampAfterOrderByTimestampAsc(int gameId, LocalDateTime fromTime);
}
