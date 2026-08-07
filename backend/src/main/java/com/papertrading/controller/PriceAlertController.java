package com.papertrading.controller;

import com.papertrading.dto.CreatePriceAlertRequest;
import com.papertrading.dto.PriceAlertDTO;
import com.papertrading.model.User;
import com.papertrading.service.PriceAlertService;
import com.papertrading.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-alerts")
public class PriceAlertController {

    private final PriceAlertService alertService;
    private final UserService userService;

    public PriceAlertController(PriceAlertService alertService, UserService userService) {
        this.alertService = alertService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<PriceAlertDTO>> getAlerts(Authentication auth) {
        User user = userService.getCurrentUser(auth);
        List<PriceAlertDTO> alerts = alertService.getAllAlerts(user);
        return ResponseEntity.ok(alerts);
    }

    @PostMapping
    public ResponseEntity<PriceAlertDTO> createAlert(Authentication auth, @RequestBody CreatePriceAlertRequest request) {
        User user = userService.getCurrentUser(auth);

        if (request.getTicker() == null || request.getTicker().isEmpty()) {
            throw new IllegalArgumentException("Ticker is required");
        }
        if (request.getTargetPrice() == null || request.getTargetPrice().signum() <= 0) {
            throw new IllegalArgumentException("Target price must be greater than 0");
        }
        if (request.getType() == null || !request.getType().matches("(?i)(ABOVE|BELOW)")) {
            throw new IllegalArgumentException("Type must be ABOVE or BELOW");
        }

        PriceAlertDTO alert = alertService.createAlert(user, request);
        return ResponseEntity.ok(alert);
    }

    @DeleteMapping("/{alertId}")
    public ResponseEntity<Void> deleteAlert(Authentication auth, @PathVariable String alertId) {
        User user = userService.getCurrentUser(auth);
        alertService.deleteAlert(user, alertId);
        return ResponseEntity.noContent().build();
    }
}
