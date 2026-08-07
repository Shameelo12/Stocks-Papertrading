package com.papertrading.controller;

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
    public ResponseEntity<List<TransactionDTO>> getTransactions(Authentication auth) {
        User user = userService.getCurrentUser(auth);
        List<TransactionDTO> transactions = portfolioService.getTransactionHistory(user);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/history")
    public ResponseEntity<List<PortfolioHistoryDTO>> getPortfolioHistory(Authentication auth) {
        User user = userService.getCurrentUser(auth);
        List<PortfolioHistoryDTO> history = portfolioService.getPortfolioHistory(user);
        return ResponseEntity.ok(history);
    }
}
