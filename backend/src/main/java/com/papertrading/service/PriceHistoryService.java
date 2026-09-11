package com.papertrading.service;

import com.papertrading.dto.PricePointDTO;
import com.papertrading.model.PricePoint;
import com.papertrading.repository.PricePointRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Builds and serves a price series per ticker.
 *
 * <p>This exists because there is no upstream source for it. Finnhub's free tier
 * returns 403 for historical candles, so the only way to draw a price chart is to
 * record the quotes the application is already fetching.
 */
@Service
public class PriceHistoryService {
    private static final Logger logger = LoggerFactory.getLogger(PriceHistoryService.class);

    private final PricePointRepository repository;
    private final PriceService priceService;
    private final int retentionDays;

    public PriceHistoryService(PricePointRepository repository,
                               PriceService priceService,
                               @Value("${price.history.retention-days:90}") int retentionDays) {
        this.repository = repository;
        this.priceService = priceService;
        this.retentionDays = retentionDays;
    }

    /**
     * Records one point per ticker anyone currently holds or watches.
     *
     * @return how many points were written
     */
    @Transactional
    public int recordSnapshot() {
        List<String> tickers = repository.findTickersOfInterest();
        if (tickers.isEmpty()) return 0;

        List<PricePoint> batch = new ArrayList<>();

        for (String ticker : tickers) {
            Optional<BigDecimal> price = priceService.getCurrentPrice(ticker);
            if (price.isEmpty()) {
                // No price is not a data point. Recording a gap as a value would
                // put a false dip in the chart.
                continue;
            }

            // Skip an unchanged repeat of the most recent value. Mock-price mode
            // returns a constant, which would otherwise write an identical row on
            // every sweep forever.
            List<PricePoint> latest = repository.findByTickerOrderByRecordedAtDesc(
                    ticker, PageRequest.of(0, 1));
            if (!latest.isEmpty() && latest.get(0).getPrice().compareTo(price.get()) == 0) {
                continue;
            }

            batch.add(new PricePoint(ticker, price.get()));
        }

        if (!batch.isEmpty()) {
            repository.saveAll(batch);
        }
        return batch.size();
    }

    /** The series for one ticker over the trailing {@code days}, oldest point first. */
    public List<PricePointDTO> getHistory(String ticker, int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        return repository
                .findByTickerAndRecordedAtAfterOrderByRecordedAtAsc(ticker.toUpperCase(), cutoff)
                .stream()
                .map(p -> new PricePointDTO(p.getRecordedAt(), p.getPrice()))
                .collect(Collectors.toList());
    }

    /** Drops points past the retention window so the table does not grow without bound. */
    @Transactional
    public int prune() {
        int removed = repository.deleteOlderThan(LocalDateTime.now().minusDays(retentionDays));
        if (removed > 0) {
            logger.info("Pruned {} price point(s) older than {} days", removed, retentionDays);
        }
        return removed;
    }
}
