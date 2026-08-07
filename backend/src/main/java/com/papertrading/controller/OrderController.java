package com.papertrading.controller;

import com.papertrading.dto.CreateLimitOrderRequest;
import com.papertrading.dto.PendingOrderDTO;
import com.papertrading.model.User;
import com.papertrading.service.OrderService;
import com.papertrading.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<PendingOrderDTO>> getOrders(Authentication auth) {
        User user = userService.getCurrentUser(auth);
        List<PendingOrderDTO> orders = orderService.getAllOrders(user);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PendingOrderDTO>> getPendingOrders(Authentication auth) {
        User user = userService.getCurrentUser(auth);
        List<PendingOrderDTO> orders = orderService.getPendingOrders(user);
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<PendingOrderDTO> createLimitOrder(Authentication auth, @RequestBody CreateLimitOrderRequest request) {
        User user = userService.getCurrentUser(auth);

        if (request.getTicker() == null || request.getTicker().isEmpty()) {
            throw new IllegalArgumentException("Ticker is required");
        }
        if (request.getShares() == null || request.getShares().signum() <= 0) {
            throw new IllegalArgumentException("Shares must be greater than 0");
        }
        if (request.getLimitPrice() == null || request.getLimitPrice().signum() <= 0) {
            throw new IllegalArgumentException("Limit price must be greater than 0");
        }
        if (request.getType() == null || !request.getType().matches("(?i)(BUY|SELL)")) {
            throw new IllegalArgumentException("Type must be BUY or SELL");
        }

        PendingOrderDTO order = orderService.createLimitOrder(user, request);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/check-pending")
    public ResponseEntity<Void> checkPendingOrders(Authentication auth) {
        User user = userService.getCurrentUser(auth);
        orderService.checkAndExecutePendingOrders(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(Authentication auth, @PathVariable String orderId) {
        User user = userService.getCurrentUser(auth);
        orderService.cancelOrder(user, orderId);
        return ResponseEntity.noContent().build();
    }
}
