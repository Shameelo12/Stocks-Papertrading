package com.papertrading.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Resolves a current share price, in three tiers: a short-lived in-memory cache,
 * then a live Finnhub quote, then static mock prices.
 *
 * <p>The cache exists because the portfolio endpoint fetches one price per holding
 * and the UI polls that endpoint every few seconds. Without it, a single user with
 * ten holdings generates roughly 200 upstream calls a minute against a free tier
 * that allows 60. A few seconds of staleness is imperceptible in this UI and
 * collapses that traffic to a handful of calls.
 */
@Service
public class PriceService {
    private static final Logger logger = LoggerFactory.getLogger(PriceService.class);

    /**
     * Upper bound on cache entries. The key space is naturally bounded by tickers
     * that actually resolve, but {@code /api/stocks/**} is unauthenticated, so this
     * guards against unbounded growth from a caller probing many symbols.
     */
    static final int MAX_ENTRIES = 500;

    private final FinnhubService finnhubService;
    private final Duration ttl;
    private final Clock clock;

    private final Map<String, CachedPrice> cache = new ConcurrentHashMap<>();

    private record CachedPrice(BigDecimal price, Instant expiresAt) {}

    @Autowired
    public PriceService(FinnhubService finnhubService,
                        @Value("${price.cache.ttl-seconds:10}") long ttlSeconds) {
        this(finnhubService, ttlSeconds, Clock.systemUTC());
    }

    /** Visible for testing: lets a test drive expiry without sleeping. */
    PriceService(FinnhubService finnhubService, long ttlSeconds, Clock clock) {
        this.finnhubService = finnhubService;
        this.ttl = Duration.ofSeconds(ttlSeconds);
        this.clock = clock;
    }

    public Optional<BigDecimal> getCurrentPrice(String ticker) {
        String key = ticker.toUpperCase();
        Instant now = clock.instant();

        CachedPrice cached = cache.get(key);
        if (cached != null && now.isBefore(cached.expiresAt())) {
            return Optional.of(cached.price());
        }

        Optional<BigDecimal> price = fetch(key);

        // Only successes are cached. Caching a miss would let one transient Finnhub
        // failure suppress quotes for that ticker for the whole TTL, which is a far
        // worse failure mode than an extra upstream call.
        price.ifPresent(p -> store(key, p, now));

        return price;
    }

    private Optional<BigDecimal> fetch(String ticker) {
        Optional<BigDecimal> live = finnhubService.getCurrentPrice(ticker);
        if (live.isPresent()) {
            return live;
        }

        logger.warn("Finnhub returned no price for {}, falling back to mock price", ticker);
        BigDecimal mock = MockPriceService.getPrice(ticker);
        if (mock != null) {
            logger.info("Using mock price for {}: {}", ticker, mock);
            return Optional.of(mock);
        }
        return Optional.empty();
    }

    private void store(String key, BigDecimal price, Instant now) {
        if (cache.size() >= MAX_ENTRIES && !cache.containsKey(key)) {
            cache.values().removeIf(entry -> !now.isBefore(entry.expiresAt()));
            if (cache.size() >= MAX_ENTRIES) {
                logger.warn("Price cache at capacity ({}); not caching {}", MAX_ENTRIES, key);
                return;
            }
        }
        cache.put(key, new CachedPrice(price, now.plus(ttl)));
    }

    /** Visible for testing. */
    int cacheSize() {
        return cache.size();
    }
}
