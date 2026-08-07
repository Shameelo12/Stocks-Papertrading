package com.papertrading.controller;

import com.papertrading.dto.TradeRequest;
import com.papertrading.dto.TradeResponse;
import com.papertrading.model.Holding;
import com.papertrading.model.User;
import com.papertrading.repository.UserRepository;
import com.papertrading.service.TradeService;
import com.papertrading.service.UserService;
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
    private final UserRepository userRepository;
    private final UserService userService;

    public TradeController(TradeService tradeService, UserRepository userRepository, UserService userService) {
        this.tradeService = tradeService;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @PostMapping("/buy")
    public ResponseEntity<Map<String, Object>> buy(@RequestBody TradeRequest request, Authentication auth) {
        try {
            User user = userService.getCurrentUser(auth);
            tradeService.buy(user, request);
            userRepository.save(user);

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
    public ResponseEntity<Map<String, Object>> sell(@RequestBody TradeRequest request, Authentication auth) {
        try {
            User user = userService.getCurrentUser(auth);
            tradeService.sell(user, request);
            userRepository.save(user);

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
