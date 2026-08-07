package com.papertrading.controller;

import com.papertrading.dto.PaginatedResponse;
import com.papertrading.dto.PortfolioHistoryDTO;
import com.papertrading.dto.PortfolioResponse;
import com.papertrading.dto.TransactionDTO;
import com.papertrading.model.User;
import com.papertrading.service.PortfolioService;
import com.papertrading.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final UserService userService;

    public PortfolioController(PortfolioService portfolioService, UserService userService) {
        this.portfolioService = portfolioService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<PortfolioResponse> getPortfolio(Authentication auth) {
        User user = userService.getCurrentUser(auth);
        PortfolioResponse portfolio = portfolioService.getPortfolio(user);
        return ResponseEntity.ok(portfolio);
    }

    @GetMapping("/transactions")
    public ResponseEntity<PaginatedResponse<TransactionDTO>> getTransactions(
            Authentication auth,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        if (limit < 1 || limit > 100) limit = 20;
        if (offset < 0) offset = 0;

        User user = userService.getCurrentUser(auth);
        List<TransactionDTO> allTransactions = portfolioService.getTransactionHistory(user);

        int total = allTransactions.size();
        List<TransactionDTO> paged = allTransactions.stream()
                .skip(offset)
                .limit(limit)
                .toList();

        return ResponseEntity.ok(new PaginatedResponse<>(paged, offset, limit, total));
    }

    @GetMapping("/history")
    public ResponseEntity<PaginatedResponse<PortfolioHistoryDTO>> getPortfolioHistory(
            Authentication auth,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "30") int limit) {
        if (limit < 1 || limit > 100) limit = 30;
        if (offset < 0) offset = 0;

        User user = userService.getCurrentUser(auth);
        List<PortfolioHistoryDTO> allHistory = portfolioService.getPortfolioHistory(user);

        int total = allHistory.size();
        List<PortfolioHistoryDTO> paged = allHistory.stream()
                .skip(offset)
                .limit(limit)
                .toList();

        return ResponseEntity.ok(new PaginatedResponse<>(paged, offset, limit, total));
    }
}
