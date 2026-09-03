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
    private final AlphaVantageService alphaVantageService;

    public OrderService(PendingOrderRepository orderRepository, TradeService tradeService, AlphaVantageService alphaVantageService) {
        this.orderRepository = orderRepository;
        this.tradeService = tradeService;
        this.alphaVantageService = alphaVantageService;
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

    public void checkAndExecutePendingOrders(User user) {
        List<PendingOrder> pendingOrders = orderRepository.findByUserAndStatus(user, PendingOrder.OrderStatus.PENDING);

        for (PendingOrder order : pendingOrders) {
            try {
                // Skip rather than defaulting to the limit price. Defaulting made the
                // comparison below trivially true, so a failed price lookup would
                // execute the order at exactly its limit — filling on missing data.
                Optional<BigDecimal> priceOpt = alphaVantageService.getCurrentPrice(order.getTicker());
                if (priceOpt.isEmpty()) {
                    logger.warn("Skipping order {}: no price available for {}", order.getId(), order.getTicker());
                    continue;
                }
                BigDecimal currentPrice = priceOpt.get();

                boolean shouldExecute = false;
                if (order.getType() == PendingOrder.OrderType.BUY && currentPrice.compareTo(order.getLimitPrice()) <= 0) {
                    shouldExecute = true;
                } else if (order.getType() == PendingOrder.OrderType.SELL && currentPrice.compareTo(order.getLimitPrice()) >= 0) {
                    shouldExecute = true;
                }

                if (shouldExecute) {
                    executeOrder(order, currentPrice);
                }
            } catch (Exception e) {
                // Log and continue: one bad order must not stop the rest of the batch.
                logger.error("Error processing order {}: {}", order.getId(), e.getMessage());
            }
        }
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
