package com.papertrading.controller;

import com.papertrading.dto.PaginatedResponse;
import com.papertrading.dto.WatchlistDTO;
import com.papertrading.model.User;
import com.papertrading.service.WatchlistService;
import com.papertrading.service.UserService;
import jakarta.validation.Valid;
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
    public ResponseEntity<PaginatedResponse<WatchlistDTO>> getWatchlist(
            Authentication auth,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "50") int limit) {
        if (limit < 1 || limit > 100) limit = 50;
        if (offset < 0) offset = 0;

        User user = userService.getCurrentUser(auth);
        List<WatchlistDTO> allWatchlist = watchlistService.getWatchlist(user);

        int total = allWatchlist.size();
        List<WatchlistDTO> paged = allWatchlist.stream()
                .skip(offset)
                .limit(limit)
                .toList();

        return ResponseEntity.ok(new PaginatedResponse<>(paged, offset, limit, total));
    }

    @PostMapping
    public ResponseEntity<WatchlistDTO> addToWatchlist(Authentication auth, @Valid @RequestBody Map<String, String> request) {
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
