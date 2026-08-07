package com.papertrading.controller;

import com.papertrading.dto.WatchlistDTO;
import com.papertrading.model.User;
import com.papertrading.service.WatchlistService;
import com.papertrading.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final UserService userService;

    public WatchlistController(WatchlistService watchlistService, UserService userService) {
        this.watchlistService = watchlistService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<WatchlistDTO>> getWatchlist(Authentication auth) {
        User user = userService.getCurrentUser(auth);
        List<WatchlistDTO> watchlist = watchlistService.getWatchlist(user);
        return ResponseEntity.ok(watchlist);
    }

    @PostMapping
    public ResponseEntity<WatchlistDTO> addToWatchlist(Authentication auth, @RequestBody Map<String, String> request) {
        User user = userService.getCurrentUser(auth);

        String ticker = request.get("ticker");
        if (ticker == null || ticker.isEmpty()) {
            throw new IllegalArgumentException("Ticker is required");
        }

        WatchlistDTO watchlist = watchlistService.addToWatchlist(user, ticker.toUpperCase());
        return ResponseEntity.ok(watchlist);
    }

    @PutMapping("/{watchlistId}")
    public ResponseEntity<WatchlistDTO> updateWatchlist(
            Authentication auth,
            @PathVariable String watchlistId,
            @RequestBody Map<String, Object> request) {
        User user = userService.getCurrentUser(auth);

        String notes = (String) request.get("notes");
        BigDecimal targetPrice = null;
        if (request.get("targetPrice") != null) {
            targetPrice = new BigDecimal(request.get("targetPrice").toString());
        }

        WatchlistDTO watchlist = watchlistService.updateWatchlist(user, watchlistId, notes, targetPrice);
        return ResponseEntity.ok(watchlist);
    }

    @DeleteMapping("/{watchlistId}")
    public ResponseEntity<Void> removeFromWatchlist(Authentication auth, @PathVariable String watchlistId) {
        User user = userService.getCurrentUser(auth);
        watchlistService.removeFromWatchlist(user, watchlistId);
        return ResponseEntity.noContent().build();
    }
}
