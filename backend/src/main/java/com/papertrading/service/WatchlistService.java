package com.papertrading.service;

import com.papertrading.dto.WatchlistDTO;
import com.papertrading.model.Watchlist;
import com.papertrading.model.User;
import com.papertrading.repository.WatchlistRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final AlphaVantageService alphaVantageService;

    public WatchlistService(WatchlistRepository watchlistRepository, AlphaVantageService alphaVantageService) {
        this.watchlistRepository = watchlistRepository;
        this.alphaVantageService = alphaVantageService;
    }

    public WatchlistDTO addToWatchlist(User user, String ticker) {
        Optional<Watchlist> existing = watchlistRepository.findByUserAndTicker(user, ticker);
        if (existing.isPresent()) {
            return toWatchlistDTO(existing.get());
        }

        Watchlist watchlist = new Watchlist(user, ticker);
        watchlistRepository.save(watchlist);
        return toWatchlistDTO(watchlist);
    }

    public List<WatchlistDTO> getWatchlist(User user) {
        return watchlistRepository.findByUser(user)
                .stream()
                .map(this::toWatchlistDTO)
                .collect(Collectors.toList());
    }

    public WatchlistDTO updateWatchlist(User user, String watchlistId, String notes, BigDecimal targetPrice) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new IllegalArgumentException("Watchlist item not found"));

        if (!watchlist.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        if (notes != null) {
            watchlist.setNotes(notes);
        }
        if (targetPrice != null) {
            watchlist.setTargetPrice(targetPrice);
        }

        watchlistRepository.save(watchlist);
        return toWatchlistDTO(watchlist);
    }

    public void removeFromWatchlist(User user, String watchlistId) {
        watchlistRepository.deleteByIdAndUser(watchlistId, user);
    }

    private WatchlistDTO toWatchlistDTO(Watchlist watchlist) {
        BigDecimal currentPrice = alphaVantageService.getCurrentPrice(watchlist.getTicker())
                .orElse(BigDecimal.ZERO);
        return new WatchlistDTO(
                watchlist.getId(),
                watchlist.getTicker(),
                watchlist.getNotes(),
                watchlist.getTargetPrice(),
                currentPrice,
                watchlist.getAddedAt()
        );
    }
}
