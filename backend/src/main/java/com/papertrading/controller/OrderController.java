package com.papertrading.controller;

import com.papertrading.dto.CreateLimitOrderRequest;
import com.papertrading.dto.PaginatedResponse;
import com.papertrading.dto.PendingOrderDTO;
import com.papertrading.model.User;
import com.papertrading.service.OrderService;
import com.papertrading.service.UserService;
import jakarta.validation.Valid;
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
    public ResponseEntity<PaginatedResponse<PendingOrderDTO>> getOrders(
            Authentication auth,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        if (limit < 1 || limit > 100) limit = 20;
        if (offset < 0) offset = 0;

        User user = userService.getCurrentUser(auth);
        List<PendingOrderDTO> allOrders = orderService.getAllOrders(user);

        int total = allOrders.size();
        List<PendingOrderDTO> paged = allOrders.stream()
                .skip(offset)
                .limit(limit)
                .toList();

        return ResponseEntity.ok(new PaginatedResponse<>(paged, offset, limit, total));
    }

    @GetMapping("/pending")
    public ResponseEntity<PaginatedResponse<PendingOrderDTO>> getPendingOrders(
            Authentication auth,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        if (limit < 1 || limit > 100) limit = 20;
        if (offset < 0) offset = 0;

        User user = userService.getCurrentUser(auth);
        List<PendingOrderDTO> allOrders = orderService.getPendingOrders(user);

        int total = allOrders.size();
        List<PendingOrderDTO> paged = allOrders.stream()
                .skip(offset)
                .limit(limit)
                .toList();

        return ResponseEntity.ok(new PaginatedResponse<>(paged, offset, limit, total));
    }

    @PostMapping
    public ResponseEntity<PendingOrderDTO> createLimitOrder(Authentication auth, @Valid @RequestBody CreateLimitOrderRequest request) {
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
