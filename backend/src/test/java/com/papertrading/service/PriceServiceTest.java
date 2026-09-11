package com.papertrading.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PriceServiceTest {

    /** A clock the test can move forward, so expiry is testable without sleeping. */
    private static class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-01-01T00:00:00Z");

        void advance(Duration d) { now = now.plus(d); }

        @Override public ZoneId getZone() { return ZoneId.of("UTC"); }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    private FinnhubService finnhub;
    private MutableClock clock;
    private PriceService priceService;

    private static final long TTL_SECONDS = 10;

    @BeforeEach
    void setUp() {
        finnhub = mock(FinnhubService.class);
        clock = new MutableClock();
        priceService = new PriceService(finnhub, TTL_SECONDS, clock);
    }

    @Test
    void firstCallFetchesFromFinnhub() {
        when(finnhub.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));

        Optional<BigDecimal> price = priceService.getCurrentPrice("AAPL");

        assertTrue(price.isPresent());
        assertEquals(new BigDecimal("150.00"), price.get());
        verify(finnhub, times(1)).getCurrentPrice("AAPL");
    }

    @Test
    void secondCallWithinTtlIsServedFromCache() {
        when(finnhub.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));

        priceService.getCurrentPrice("AAPL");
        clock.advance(Duration.ofSeconds(TTL_SECONDS - 1));
        Optional<BigDecimal> second = priceService.getCurrentPrice("AAPL");

        assertEquals(new BigDecimal("150.00"), second.orElseThrow());
        verify(finnhub, times(1)).getCurrentPrice("AAPL");
    }

    @Test
    void callAfterTtlRefetches() {
        when(finnhub.getCurrentPrice("AAPL"))
                .thenReturn(Optional.of(new BigDecimal("150.00")))
                .thenReturn(Optional.of(new BigDecimal("155.00")));

        priceService.getCurrentPrice("AAPL");
        clock.advance(Duration.ofSeconds(TTL_SECONDS + 1));
        Optional<BigDecimal> second = priceService.getCurrentPrice("AAPL");

        assertEquals(new BigDecimal("155.00"), second.orElseThrow());
        verify(finnhub, times(2)).getCurrentPrice("AAPL");
    }

    @Test
    void tickerCaseIsNormalisedToOneCacheEntry() {
        when(finnhub.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));

        priceService.getCurrentPrice("aapl");
        priceService.getCurrentPrice("AaPl");
        priceService.getCurrentPrice("AAPL");

        verify(finnhub, times(1)).getCurrentPrice("AAPL");
        assertEquals(1, priceService.cacheSize());
    }

    @Test
    void unresolvableTickerIsNotCached() {
        // ZZZZ is absent from MockPriceService, so the whole chain yields empty.
        when(finnhub.getCurrentPrice("ZZZZ")).thenReturn(Optional.empty());

        assertTrue(priceService.getCurrentPrice("ZZZZ").isEmpty());
        assertTrue(priceService.getCurrentPrice("ZZZZ").isEmpty());

        // Caching a miss would let one transient outage suppress the ticker for the
        // whole TTL, so both calls must reach Finnhub.
        verify(finnhub, times(2)).getCurrentPrice("ZZZZ");
        assertEquals(0, priceService.cacheSize());
    }

    @Test
    void fallsBackToMockPriceWhenFinnhubHasNothing() {
        when(finnhub.getCurrentPrice("TSLA")).thenReturn(Optional.empty());

        Optional<BigDecimal> price = priceService.getCurrentPrice("TSLA");

        assertTrue(price.isPresent(), "TSLA should resolve via MockPriceService");
        assertTrue(price.get().signum() > 0);
    }

    @Test
    void mockFallbackIsAlsoCached() {
        when(finnhub.getCurrentPrice("TSLA")).thenReturn(Optional.empty());

        priceService.getCurrentPrice("TSLA");
        priceService.getCurrentPrice("TSLA");

        // The fallback succeeded, so the second call is served from cache and
        // does not re-attempt Finnhub.
        verify(finnhub, times(1)).getCurrentPrice("TSLA");
    }

    @Test
    void cacheDoesNotGrowWithoutBound() {
        when(finnhub.getCurrentPrice(anyString())).thenAnswer(inv -> Optional.of(new BigDecimal("1.00")));

        for (int i = 0; i < PriceService.MAX_ENTRIES + 50; i++) {
            priceService.getCurrentPrice("SYM" + i);
        }

        assertTrue(priceService.cacheSize() <= PriceService.MAX_ENTRIES,
                "cache grew past its bound: " + priceService.cacheSize());
    }

    @Test
    void expiredEntriesArePurgedWhenCapacityIsReached() {
        when(finnhub.getCurrentPrice(anyString())).thenAnswer(inv -> Optional.of(new BigDecimal("1.00")));

        for (int i = 0; i < PriceService.MAX_ENTRIES; i++) {
            priceService.getCurrentPrice("SYM" + i);
        }
        assertEquals(PriceService.MAX_ENTRIES, priceService.cacheSize());

        // Once everything has expired, a new insert should reclaim the space
        // rather than refusing to cache.
        clock.advance(Duration.ofSeconds(TTL_SECONDS + 1));
        priceService.getCurrentPrice("FRESH");

        assertEquals(1, priceService.cacheSize());
    }
}
