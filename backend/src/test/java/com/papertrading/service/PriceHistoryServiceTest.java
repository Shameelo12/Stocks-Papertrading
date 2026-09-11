package com.papertrading.service;

import com.papertrading.dto.PricePointDTO;
import com.papertrading.model.PricePoint;
import com.papertrading.repository.PricePointRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PriceHistoryServiceTest {

    @Mock
    private PricePointRepository repository;

    @Mock
    private PriceService priceService;

    private PriceHistoryService service;

    private static final int RETENTION_DAYS = 90;

    @BeforeEach
    void setUp() {
        service = new PriceHistoryService(repository, priceService, RETENTION_DAYS);
        // No prior history unless a test says otherwise.
        when(repository.findByTickerOrderByRecordedAtDesc(anyString(), any())).thenReturn(List.of());
    }

    @Test
    void recordsOnePointPerTrackedTicker() {
        when(repository.findTickersOfInterest()).thenReturn(List.of("AAPL", "MSFT"));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));
        when(priceService.getCurrentPrice("MSFT")).thenReturn(Optional.of(new BigDecimal("400.00")));

        assertEquals(2, service.recordSnapshot());

        ArgumentCaptor<List<PricePoint>> saved = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(saved.capture());
        assertEquals(2, saved.getValue().size());
    }

    @Test
    void doesNotRecordAGapAsAValue() {
        when(repository.findTickersOfInterest()).thenReturn(List.of("ZZZZ"));
        when(priceService.getCurrentPrice("ZZZZ")).thenReturn(Optional.empty());

        assertEquals(0, service.recordSnapshot());

        // Writing a zero or a placeholder here would put a false dip in the chart.
        verify(repository, never()).saveAll(any());
    }

    @Test
    void skipsAnUnchangedRepeatOfTheLatestPrice() {
        PricePoint existing = new PricePoint("AAPL", new BigDecimal("150.00"));
        when(repository.findTickersOfInterest()).thenReturn(List.of("AAPL"));
        when(repository.findByTickerOrderByRecordedAtDesc(eq("AAPL"), any())).thenReturn(List.of(existing));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));

        // Mock-price mode returns a constant; without this guard every sweep would
        // append an identical row forever.
        assertEquals(0, service.recordSnapshot());
        verify(repository, never()).saveAll(any());
    }

    @Test
    void recordsWhenThePriceHasMoved() {
        PricePoint existing = new PricePoint("AAPL", new BigDecimal("150.00"));
        when(repository.findTickersOfInterest()).thenReturn(List.of("AAPL"));
        when(repository.findByTickerOrderByRecordedAtDesc(eq("AAPL"), any())).thenReturn(List.of(existing));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.01")));

        assertEquals(1, service.recordSnapshot());
    }

    @Test
    void oneUnpricedTickerDoesNotBlockTheRest() {
        when(repository.findTickersOfInterest()).thenReturn(List.of("ZZZZ", "AAPL"));
        when(priceService.getCurrentPrice("ZZZZ")).thenReturn(Optional.empty());
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));

        assertEquals(1, service.recordSnapshot());
    }

    @Test
    void nothingTrackedMeansNoWork() {
        when(repository.findTickersOfInterest()).thenReturn(List.of());

        assertEquals(0, service.recordSnapshot());
        verify(priceService, never()).getCurrentPrice(anyString());
    }

    @Test
    void historyIsReturnedOldestFirstForTheRequestedWindow() {
        PricePoint p1 = new PricePoint("AAPL", new BigDecimal("150.00"));
        PricePoint p2 = new PricePoint("AAPL", new BigDecimal("152.00"));
        when(repository.findByTickerAndRecordedAtAfterOrderByRecordedAtAsc(eq("AAPL"), any()))
                .thenReturn(List.of(p1, p2));

        List<PricePointDTO> history = service.getHistory("aapl", 30);

        assertEquals(2, history.size());
        assertEquals(new BigDecimal("150.00"), history.get(0).price());
    }

    @Test
    void tickerIsUpperCasedBeforeLookup() {
        when(repository.findByTickerAndRecordedAtAfterOrderByRecordedAtAsc(anyString(), any()))
                .thenReturn(List.of());

        service.getHistory("aapl", 30);

        verify(repository).findByTickerAndRecordedAtAfterOrderByRecordedAtAsc(eq("AAPL"), any());
    }

    @Test
    void pruneUsesTheConfiguredRetentionWindow() {
        when(repository.deleteOlderThan(any())).thenReturn(7);

        assertEquals(7, service.prune());

        ArgumentCaptor<LocalDateTime> cutoff = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(repository).deleteOlderThan(cutoff.capture());
        long daysBack = java.time.Duration.between(cutoff.getValue(), LocalDateTime.now()).toDays();
        assertEquals(RETENTION_DAYS, daysBack, 1);
    }
}
