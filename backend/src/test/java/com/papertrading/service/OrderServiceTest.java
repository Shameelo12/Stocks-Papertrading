package com.papertrading.service;

import com.papertrading.dto.CreateLimitOrderRequest;
import com.papertrading.dto.PendingOrderDTO;
import com.papertrading.model.PendingOrder;
import com.papertrading.model.User;
import com.papertrading.repository.PendingOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private PendingOrderRepository orderRepository;

    @Mock
    private TradeService tradeService;

    @Mock
    private PriceService priceService;

    private OrderService orderService;
    private User user;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, tradeService, priceService);
        user = new User("trader@example.com", "hash");
        user.setId("user-1");
    }

    private PendingOrder order(PendingOrder.OrderType type, String limit) {
        return new PendingOrder(user, "AAPL", type, new BigDecimal("10"), new BigDecimal(limit));
    }

    // ---------- creation ----------

    @Test
    void createLimitOrderUpperCasesTickerAndPersists() {
        CreateLimitOrderRequest request = new CreateLimitOrderRequest(
                "aapl", "buy", new BigDecimal("10"), new BigDecimal("150.00"));

        PendingOrderDTO dto = orderService.createLimitOrder(user, request);

        assertEquals("AAPL", dto.getTicker());
        assertEquals("BUY", dto.getType());
        assertEquals("PENDING", dto.getStatus());
        verify(orderRepository).save(any(PendingOrder.class));
    }

    // ---------- cancellation ----------

    @Test
    void cancelSetsStatusCancelled() {
        PendingOrder o = order(PendingOrder.OrderType.BUY, "150.00");
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(o));

        orderService.cancelOrder(user, "order-1");

        assertEquals(PendingOrder.OrderStatus.CANCELLED, o.getStatus());
        verify(orderRepository).save(o);
    }

    @Test
    void cancelRejectsAnotherUsersOrder() {
        User attacker = new User("attacker@example.com", "hash");
        attacker.setId("user-2");
        PendingOrder victimsOrder = order(PendingOrder.OrderType.BUY, "150.00");
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(victimsOrder));

        assertThrows(IllegalArgumentException.class, () -> orderService.cancelOrder(attacker, "order-1"));

        assertEquals(PendingOrder.OrderStatus.PENDING, victimsOrder.getStatus(),
                "another user's order must be left untouched");
        verify(orderRepository, never()).save(any());
    }

    @Test
    void cancelRejectsUnknownOrder() {
        when(orderRepository.findById("nope")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> orderService.cancelOrder(user, "nope"));
    }

    // ---------- execution rules ----------

    @Test
    void buyFillsBelowLimit() {
        PendingOrder o = order(PendingOrder.OrderType.BUY, "150.00");
        when(orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING)).thenReturn(List.of(o));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("145.00")));

        assertEquals(1, orderService.checkAndExecutePendingOrders(user));
        assertEquals(PendingOrder.OrderStatus.EXECUTED, o.getStatus());
        assertNotNull(o.getExecutedAt());
        verify(tradeService).buy(eq(user), any());
    }

    @Test
    void buyFillsAtExactlyTheLimit() {
        PendingOrder o = order(PendingOrder.OrderType.BUY, "150.00");
        when(orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING)).thenReturn(List.of(o));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));

        assertEquals(1, orderService.checkAndExecutePendingOrders(user));
    }

    @Test
    void buyDoesNotFillAboveLimit() {
        PendingOrder o = order(PendingOrder.OrderType.BUY, "150.00");
        when(orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING)).thenReturn(List.of(o));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.01")));

        assertEquals(0, orderService.checkAndExecutePendingOrders(user));
        assertEquals(PendingOrder.OrderStatus.PENDING, o.getStatus());
        verify(tradeService, never()).buy(any(), any());
    }

    @Test
    void sellFillsAboveLimit() {
        PendingOrder o = order(PendingOrder.OrderType.SELL, "150.00");
        when(orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING)).thenReturn(List.of(o));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("155.00")));

        assertEquals(1, orderService.checkAndExecutePendingOrders(user));
        verify(tradeService).sell(eq(user), any());
    }

    @Test
    void sellDoesNotFillBelowLimit() {
        PendingOrder o = order(PendingOrder.OrderType.SELL, "150.00");
        when(orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING)).thenReturn(List.of(o));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("149.99")));

        assertEquals(0, orderService.checkAndExecutePendingOrders(user));
        verify(tradeService, never()).sell(any(), any());
    }

    // ---------- failure handling ----------

    @Test
    void missingPriceNeverFills() {
        PendingOrder o = order(PendingOrder.OrderType.BUY, "150.00");
        when(orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING)).thenReturn(List.of(o));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.empty());

        assertEquals(0, orderService.checkAndExecutePendingOrders(user));
        assertEquals(PendingOrder.OrderStatus.PENDING, o.getStatus());

        // Regression guard: this once defaulted to the order's own limit price,
        // which made the comparison trivially true and would have filled every
        // pending order during a price outage.
        verify(tradeService, never()).buy(any(), any());
    }

    @Test
    void oneFailingOrderDoesNotStopTheBatch() {
        PendingOrder bad = order(PendingOrder.OrderType.BUY, "150.00");
        PendingOrder good = order(PendingOrder.OrderType.BUY, "150.00");
        when(orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING))
                .thenReturn(List.of(bad, good));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("145.00")));
        when(tradeService.buy(any(), any()))
                .thenThrow(new IllegalArgumentException("Insufficient balance"))
                .thenReturn(null);

        assertEquals(1, orderService.checkAndExecutePendingOrders(user));
        assertEquals(PendingOrder.OrderStatus.PENDING, bad.getStatus(), "failed order stays pending for retry");
        assertEquals(PendingOrder.OrderStatus.EXECUTED, good.getStatus());
    }

    // ---------- scheduled sweep ----------

    @Test
    void sweepEvaluatesEveryUsersPendingOrders() {
        PendingOrder o = order(PendingOrder.OrderType.BUY, "150.00");
        when(orderRepository.findByStatus(PendingOrder.OrderStatus.PENDING)).thenReturn(List.of(o));
        when(priceService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("145.00")));

        assertEquals(1, orderService.checkAndExecuteAllPendingOrders());

        // The sweep must not be scoped to a single user.
        verify(orderRepository).findByStatus(PendingOrder.OrderStatus.PENDING);
        verify(orderRepository, never()).findByUserAndStatus(any(), any());
    }

    @Test
    void sweepWithNothingPendingDoesNoWork() {
        when(orderRepository.findByStatus(PendingOrder.OrderStatus.PENDING)).thenReturn(List.of());

        assertEquals(0, orderService.checkAndExecuteAllPendingOrders());
        verify(priceService, never()).getCurrentPrice(anyString());
    }
}
