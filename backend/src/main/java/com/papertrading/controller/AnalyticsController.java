package com.papertrading.controller;

import com.papertrading.dto.TradeStatsDTO;
import com.papertrading.model.User;
import com.papertrading.repository.UserRepository;
import com.papertrading.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    public AnalyticsController(AnalyticsService analyticsService, UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<TradeStatsDTO> getTradeStats(Authentication auth) {
        String userId = auth.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TradeStatsDTO stats = analyticsService.getTradeStats(user);
        return ResponseEntity.ok(stats);
    }
}
