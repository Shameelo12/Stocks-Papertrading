package com.papertrading.controller;

import com.papertrading.dto.TradeRequest;
import com.papertrading.dto.TradeResponse;
import com.papertrading.model.Holding;
import com.papertrading.model.User;
import com.papertrading.service.TradeService;
import com.papertrading.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/trade")
public class TradeController {

    private final TradeService tradeService;
    private final UserService userService;

    public TradeController(TradeService tradeService, UserService userService) {
        this.tradeService = tradeService;
        this.userService = userService;
    }

    @PostMapping("/buy")
    public ResponseEntity<Map<String, Object>> buy(@Valid @RequestBody TradeRequest request, Authentication auth) {
        try {
            User user = userService.getCurrentUser(auth);
            tradeService.buy(user, request);

            return ResponseEntity.ok(Map.of(
                    "balance", user.getBalance(),
                    "message", "Buy successful"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sell")
    public ResponseEntity<Map<String, Object>> sell(@Valid @RequestBody TradeRequest request, Authentication auth) {
        try {
            User user = userService.getCurrentUser(auth);
            tradeService.sell(user, request);

            return ResponseEntity.ok(Map.of(
                    "balance", user.getBalance(),
                    "message", "Sell successful"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
