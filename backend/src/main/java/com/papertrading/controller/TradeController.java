package com.papertrading.controller;

import com.papertrading.dto.TradeRequest;
import com.papertrading.model.User;
import com.papertrading.service.TradeService;
import com.papertrading.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    // Failures deliberately propagate to GlobalExceptionHandler rather than being
    // caught here. Catching them locally produced a {"error": "..."} body while
    // every other endpoint returned the ErrorResponse shape {"message": "..."},
    // so clients had to special-case these two routes to read an error message.

    @PostMapping("/buy")
    public ResponseEntity<Map<String, Object>> buy(@Valid @RequestBody TradeRequest request, Authentication auth) {
        User user = userService.getCurrentUser(auth);
        tradeService.buy(user, request);

        return ResponseEntity.ok(Map.of(
                "balance", user.getBalance(),
                "message", "Buy successful"
        ));
    }

    @PostMapping("/sell")
    public ResponseEntity<Map<String, Object>> sell(@Valid @RequestBody TradeRequest request, Authentication auth) {
        User user = userService.getCurrentUser(auth);
        tradeService.sell(user, request);

        return ResponseEntity.ok(Map.of(
                "balance", user.getBalance(),
                "message", "Sell successful"
        ));
    }
}
