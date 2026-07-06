package com.papertrading.controller;

import com.papertrading.dto.CreateLimitOrderRequest;
import com.papertrading.dto.PendingOrderDTO;
import com.papertrading.model.User;
import com.papertrading.repository.UserRepository;
import com.papertrading.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<PendingOrderDTO>> getOrders(Authentication auth) {
        String userId = auth.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<PendingOrderDTO> orders = orderService.getAllOrders(user);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PendingOrderDTO>> getPendingOrders(Authentication auth) {
        String userId = auth.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<PendingOrderDTO> orders = orderService.getPendingOrders(user);
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<PendingOrderDTO> createLimitOrder(Authentication auth, @RequestBody CreateLimitOrderRequest request) {
        String userId = auth.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

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
        String userId = auth.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        orderService.checkAndExecutePendingOrders(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(Authentication auth, @PathVariable String orderId) {
        String userId = auth.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        orderService.cancelOrder(user, orderId);
        return ResponseEntity.noContent().build();
    }
}
