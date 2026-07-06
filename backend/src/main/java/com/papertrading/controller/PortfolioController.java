package com.papertrading.controller;

import com.papertrading.dto.PortfolioHistoryDTO;
import com.papertrading.dto.PortfolioResponse;
import com.papertrading.dto.TransactionDTO;
import com.papertrading.model.User;
import com.papertrading.repository.UserRepository;
import com.papertrading.service.PortfolioService;
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
    private final UserRepository userRepository;

    public PortfolioController(PortfolioService portfolioService, UserRepository userRepository) {
        this.portfolioService = portfolioService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<PortfolioResponse> getPortfolio(Authentication auth) {
        String userId = auth.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        PortfolioResponse portfolio = portfolioService.getPortfolio(user);
        return ResponseEntity.ok(portfolio);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDTO>> getTransactions(Authentication auth) {
        String userId = auth.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<TransactionDTO> transactions = portfolioService.getTransactionHistory(user);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/history")
    public ResponseEntity<List<PortfolioHistoryDTO>> getPortfolioHistory(Authentication auth) {
        String userId = auth.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<PortfolioHistoryDTO> history = portfolioService.getPortfolioHistory(user);
        return ResponseEntity.ok(history);
    }
}
