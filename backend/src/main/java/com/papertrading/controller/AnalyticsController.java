package com.papertrading.controller;

import com.papertrading.dto.TradeStatsDTO;
import com.papertrading.model.User;
import com.papertrading.service.AnalyticsService;
import com.papertrading.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserService userService;

    public AnalyticsController(AnalyticsService analyticsService, UserService userService) {
        this.analyticsService = analyticsService;
        this.userService = userService;
    }

    @GetMapping("/stats")
    public ResponseEntity<TradeStatsDTO> getTradeStats(Authentication auth) {
        User user = userService.getCurrentUser(auth);
        TradeStatsDTO stats = analyticsService.getTradeStats(user);
        return ResponseEntity.ok(stats);
    }
}
