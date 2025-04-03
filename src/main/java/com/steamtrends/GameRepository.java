package com.steamtrends.repository;

import com.steamtrends.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional; 

@Repository
public interface GameRepository extends JpaRepository<Game, Integer> {
    List<Game> findTop10ByOrderByCurrentPlayersDesc();
    List<Game> findAllByOrderByCurrentPlayersDesc();
    Optional<Game> findById(Integer gameId);
}
