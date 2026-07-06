package com.papertrading.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PortfolioHistoryDTO {
    private LocalDateTime timestamp;
    private BigDecimal portfolioValue;
    private BigDecimal balance;
    private BigDecimal investedValue;

    public PortfolioHistoryDTO(LocalDateTime timestamp, BigDecimal portfolioValue, BigDecimal balance, BigDecimal investedValue) {
        this.timestamp = timestamp;
        this.portfolioValue = portfolioValue;
        this.balance = balance;
        this.investedValue = investedValue;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public BigDecimal getPortfolioValue() {
        return portfolioValue;
    }

    public void setPortfolioValue(BigDecimal portfolioValue) {
        this.portfolioValue = portfolioValue;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getInvestedValue() {
        return investedValue;
    }

    public void setInvestedValue(BigDecimal investedValue) {
        this.investedValue = investedValue;
    }
}
