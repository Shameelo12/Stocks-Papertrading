package com.papertrading.scheduler;

import com.papertrading.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Drives limit order execution on a timer.
 *
 * <p>Previously orders were only evaluated when a client called
 * {@code POST /orders/check-pending}, which meant an order filled when its owner
 * happened to refresh the page rather than when its price was actually reached.
 * A user who placed an order and closed the tab would never have it fill.
 */
@Component
public class PendingOrderScheduler {
    private static final Logger logger = LoggerFactory.getLogger(PendingOrderScheduler.class);

    private final OrderService orderService;

    public PendingOrderScheduler(OrderService orderService) {
        this.orderService = orderService;
    }

    @Scheduled(
            fixedDelayString = "${orders.execution-interval-ms:30000}",
            initialDelayString = "${orders.execution-initial-delay-ms:15000}"
    )
    public void executeEligibleOrders() {
        try {
            int filled = orderService.checkAndExecuteAllPendingOrders();
            if (filled > 0) {
                logger.info("Order sweep filled {} limit order(s)", filled);
            }
        } catch (Exception e) {
            // An uncaught exception here would cancel every future run of this
            // schedule, silently stopping order execution for the whole process.
            logger.error("Order sweep failed; will retry next interval", e);
        }
    }
}
