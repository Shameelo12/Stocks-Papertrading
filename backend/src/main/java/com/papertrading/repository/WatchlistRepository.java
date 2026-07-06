package com.papertrading.repository;

import com.papertrading.model.Watchlist;
import com.papertrading.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, String> {
    List<Watchlist> findByUser(User user);
    Optional<Watchlist> findByUserAndTicker(User user, String ticker);
    void deleteByIdAndUser(String id, User user);
}
