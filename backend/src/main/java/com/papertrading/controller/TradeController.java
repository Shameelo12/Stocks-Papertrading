package com.papertrading.controller;

import com.papertrading.dto.TradeRequest;
import com.papertrading.model.Holding;
import com.papertrading.model.User;
import com.papertrading.repository.UserRepository;
import com.papertrading.service.TradeService;
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

    public TradeController(TradeService tradeService, UserRepository userRepository) {
        this.tradeService = tradeService;
        this.userRepository = userRepository;
    }

    @PostMapping("/buy")
    public ResponseEntity<Map<String, Object>> buy(@RequestBody TradeRequest request, Authentication auth) {
        try {
            String userId = auth.getName();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Holding holding = tradeService.buy(user, request);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("holding", holding);
            response.put("balance", user.getBalance());
            response.put("message", "Buy successful");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sell")
    public ResponseEntity<Map<String, Object>> sell(@RequestBody TradeRequest request, Authentication auth) {
        try {
            String userId = auth.getName();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Holding holding = tradeService.sell(user, request);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("holding", holding);
            response.put("balance", user.getBalance());
            response.put("message", "Sell successful");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
