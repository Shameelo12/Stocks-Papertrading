package com.papertrading.service;

import com.papertrading.model.PriceAlert;
import com.papertrading.model.User;
import com.papertrading.repository.PriceAlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PriceAlertEvaluatorTest {

    @Mock
    private PriceAlertRepository alertRepository;

    @Mock
    private PriceService priceService;

    private PriceAlertEvaluator evaluator;
    private User user;

    @BeforeEach
    void setUp() {
        evaluator = new PriceAlertEvaluator(alertRepository, priceService);
        user = new User("trader@example.com", "hash");
        user.setId("user-1");
    }

    private PriceAlert alert(String ticker, String target, PriceAlert.AlertType type) {
        return new PriceAlert(user, ticker, new BigDecimal(target), type);
    }

    @Test
    void aboveAlertFiresWhenPriceReachesTarget() {
        PriceAlert a = alert("AAPL", "150.00", PriceAlert.AlertType.ABOVE);
        when(alertRepository.findByActive(true)).thenReturn(List.of(a));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("152.00")));

        assertEquals(1, evaluator.evaluateAll());
        assertFalse(a.isActive());
        assertNotNull(a.getTriggeredAt());
    }

    @Test
    void aboveAlertFiresOnExactTarget() {
        PriceAlert a = alert("AAPL", "150.00", PriceAlert.AlertType.ABOVE);
        when(alertRepository.findByActive(true)).thenReturn(List.of(a));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));

        assertEquals(1, evaluator.evaluateAll(), "reaching the target counts as reaching it");
    }

    @Test
    void aboveAlertStaysPendingBelowTarget() {
        PriceAlert a = alert("AAPL", "150.00", PriceAlert.AlertType.ABOVE);
        when(alertRepository.findByActive(true)).thenReturn(List.of(a));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("149.99")));

        assertEquals(0, evaluator.evaluateAll());
        assertTrue(a.isActive());
        assertNull(a.getTriggeredAt());
        verify(alertRepository, never()).saveAll(any());
    }

    @Test
    void belowAlertFiresWhenPriceFallsToTarget() {
        PriceAlert a = alert("TSLA", "200.00", PriceAlert.AlertType.BELOW);
        when(alertRepository.findByActive(true)).thenReturn(List.of(a));
        when(priceService.getCurrentPrice("TSLA")).thenReturn(Optional.of(new BigDecimal("195.00")));

        assertEquals(1, evaluator.evaluateAll());
        assertFalse(a.isActive());
    }

    @Test
    void belowAlertStaysPendingAboveTarget() {
        PriceAlert a = alert("TSLA", "200.00", PriceAlert.AlertType.BELOW);
        when(alertRepository.findByActive(true)).thenReturn(List.of(a));
        when(priceService.getCurrentPrice("TSLA")).thenReturn(Optional.of(new BigDecimal("205.00")));

        assertEquals(0, evaluator.evaluateAll());
        assertTrue(a.isActive());
    }

    @Test
    void alertsOnOneTickerCostOnlyOnePriceLookup() {
        when(alertRepository.findByActive(true)).thenReturn(List.of(
                alert("AAPL", "150.00", PriceAlert.AlertType.ABOVE),
                alert("AAPL", "160.00", PriceAlert.AlertType.ABOVE),
                alert("AAPL", "100.00", PriceAlert.AlertType.BELOW)
        ));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("155.00")));

        evaluator.evaluateAll();

        verify(priceService, times(1)).getCurrentPrice("AAPL");
    }

    @Test
    void missingPriceLeavesAlertsPendingRatherThanFiringThem() {
        PriceAlert a = alert("ZZZZ", "10.00", PriceAlert.AlertType.BELOW);
        when(alertRepository.findByActive(true)).thenReturn(List.of(a));
        when(priceService.getCurrentPrice("ZZZZ")).thenReturn(Optional.empty());

        assertEquals(0, evaluator.evaluateAll());
        assertTrue(a.isActive(), "an unavailable price must never trigger an alert");
        verify(alertRepository, never()).saveAll(any());
    }

    @Test
    void oneUnpricedTickerDoesNotBlockOthers() {
        PriceAlert broken = alert("ZZZZ", "10.00", PriceAlert.AlertType.BELOW);
        PriceAlert good = alert("AAPL", "150.00", PriceAlert.AlertType.ABOVE);
        when(alertRepository.findByActive(true)).thenReturn(List.of(broken, good));
        when(priceService.getCurrentPrice("ZZZZ")).thenReturn(Optional.empty());
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("155.00")));

        assertEquals(1, evaluator.evaluateAll());
        assertTrue(broken.isActive());
        assertFalse(good.isActive());
    }

    @Test
    void onlyFiredAlertsArePersisted() {
        PriceAlert fires = alert("AAPL", "150.00", PriceAlert.AlertType.ABOVE);
        PriceAlert waits = alert("AAPL", "900.00", PriceAlert.AlertType.ABOVE);
        when(alertRepository.findByActive(true)).thenReturn(List.of(fires, waits));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("155.00")));

        evaluator.evaluateAll();

        ArgumentCaptor<List<PriceAlert>> saved = ArgumentCaptor.forClass(List.class);
        verify(alertRepository).saveAll(saved.capture());
        assertEquals(1, saved.getValue().size());
        assertSame(fires, saved.getValue().get(0));
    }

    @Test
    void noActiveAlertsDoesNoWork() {
        when(alertRepository.findByActive(true)).thenReturn(List.of());

        assertEquals(0, evaluator.evaluateAll());
        verify(priceService, never()).getCurrentPrice(anyString());
    }

    @Test
    void tickerCaseDoesNotSplitLookups() {
        when(alertRepository.findByActive(true)).thenReturn(List.of(
                alert("aapl", "150.00", PriceAlert.AlertType.ABOVE),
                alert("AAPL", "160.00", PriceAlert.AlertType.ABOVE)
        ));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("155.00")));

        evaluator.evaluateAll();

        verify(priceService, times(1)).getCurrentPrice("AAPL");
    }
}
