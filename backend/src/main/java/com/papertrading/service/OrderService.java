package com.papertrading.service;

import com.papertrading.dto.CreateLimitOrderRequest;
import com.papertrading.dto.PendingOrderDTO;
import com.papertrading.dto.TradeRequest;
import com.papertrading.model.PendingOrder;
import com.papertrading.model.User;
import com.papertrading.repository.PendingOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final PendingOrderRepository orderRepository;
    private final TradeService tradeService;
    private final PriceService priceService;

    public OrderService(PendingOrderRepository orderRepository, TradeService tradeService, PriceService priceService) {
        this.orderRepository = orderRepository;
        this.tradeService = tradeService;
        this.priceService = priceService;
    }

    public PendingOrderDTO createLimitOrder(User user, CreateLimitOrderRequest request) {
        PendingOrder.OrderType type = PendingOrder.OrderType.valueOf(request.getType().toUpperCase());
        PendingOrder order = new PendingOrder(user, request.getTicker().toUpperCase(), type, request.getShares(), request.getLimitPrice());
        orderRepository.save(order);
        return toPendingOrderDTO(order);
    }

    public List<PendingOrderDTO> getPendingOrders(User user) {
        return orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING)
                .stream()
                .map(this::toPendingOrderDTO)
                .collect(Collectors.toList());
    }

    public List<PendingOrderDTO> getAllOrders(User user) {
        return orderRepository.findByUser(user)
                .stream()
                .map(this::toPendingOrderDTO)
                .collect(Collectors.toList());
    }

    public void cancelOrder(User user, String orderId) {
        PendingOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        order.setStatus(PendingOrder.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    /** Evaluates one user's unfilled orders. Invoked on demand from the API. */
    public int checkAndExecutePendingOrders(User user) {
        return processOrders(orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING));
    }

    /**
     * Evaluates every unfilled order in the system. Invoked by the scheduler, so
     * an order fills when its price is reached rather than when its owner happens
     * to refresh the page.
     */
    public int checkAndExecuteAllPendingOrders() {
        // findByStatusWithUser, not findByStatus: this runs outside any request, so
        // the order's LAZY user proxy has no session to initialise against. See the
        // repository method for the failure this avoids.
        //
        // Deliberately not @Transactional. Each fill runs in TradeService's own
        // transaction, so one order failing cannot mark a shared transaction
        // rollback-only and poison the rest of the sweep.
        return processOrders(orderRepository.findByStatusWithUser(PendingOrder.OrderStatus.PENDING));
    }

    /**
     * @return how many of {@code orders} were filled
     */
    private int processOrders(List<PendingOrder> orders) {
        int executed = 0;

        for (PendingOrder order : orders) {
            try {
                // Skip rather than defaulting to the limit price. Defaulting made the
                // comparison below trivially true, so a failed price lookup would
                // execute the order at exactly its limit — filling on missing data.
                Optional<BigDecimal> priceOpt = priceService.getCurrentPrice(order.getTicker());
                if (priceOpt.isEmpty()) {
                    logger.warn("Skipping order {}: no price available for {}", order.getId(), order.getTicker());
                    continue;
                }
                BigDecimal currentPrice = priceOpt.get();

                if (shouldExecute(order, currentPrice)) {
                    executeOrder(order, currentPrice);
                    executed++;
                }
            } catch (Exception e) {
                // Log and continue: one bad order must not stop the rest of the batch.
                logger.error("Error processing order {}: {}", order.getId(), e.getMessage());
            }
        }

        return executed;
    }

    /**
     * A buy fills at or below its limit; a sell fills at or above it.
     */
    private boolean shouldExecute(PendingOrder order, BigDecimal currentPrice) {
        return order.getType() == PendingOrder.OrderType.BUY
                ? currentPrice.compareTo(order.getLimitPrice()) <= 0
                : currentPrice.compareTo(order.getLimitPrice()) >= 0;
    }

    private void executeOrder(PendingOrder order, BigDecimal executionPrice) {
        try {
            TradeRequest tradeRequest = new TradeRequest(order.getTicker(), order.getShares());
            if (order.getType() == PendingOrder.OrderType.BUY) {
                tradeService.buy(order.getUser(), tradeRequest);
            } else {
                tradeService.sell(order.getUser(), tradeRequest);
            }

            order.setStatus(PendingOrder.OrderStatus.EXECUTED);
            order.setExecutedAt(LocalDateTime.now());
            orderRepository.save(order);
        } catch (Exception e) {
            // Order execution failed - leave as PENDING for retry
            throw new RuntimeException("Failed to execute order: " + e.getMessage());
        }
    }

    private PendingOrderDTO toPendingOrderDTO(PendingOrder order) {
        return new PendingOrderDTO(
                order.getId(),
                order.getTicker(),
                order.getType().name(),
                order.getShares(),
                order.getLimitPrice(),
                order.getStatus().name(),
                order.getCreatedAt(),
                order.getExecutedAt()
        );
    }
}
