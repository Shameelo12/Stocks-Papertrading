package com.papertrading.dto;

import java.math.BigDecimal;
import java.util.List;

public class PortfolioResponse {
    private BigDecimal currentBalance;
    private BigDecimal investedBalance;
    private BigDecimal totalPortfolioValue;
    private BigDecimal totalGainLoss;
    private BigDecimal totalGainLossPercent;
    private List<HoldingDTO> holdings;

    public PortfolioResponse() {}

    public PortfolioResponse(BigDecimal currentBalance, BigDecimal investedBalance,
                           BigDecimal totalPortfolioValue, BigDecimal totalGainLoss,
                           BigDecimal totalGainLossPercent, List<HoldingDTO> holdings) {
        this.currentBalance = currentBalance;
        this.investedBalance = investedBalance;
        this.totalPortfolioValue = totalPortfolioValue;
        this.totalGainLoss = totalGainLoss;
        this.totalGainLossPercent = totalGainLossPercent;
        this.holdings = holdings;
    }

    // Getters
    public BigDecimal getCurrentBalance() { return currentBalance; }
    public BigDecimal getInvestedBalance() { return investedBalance; }
    public BigDecimal getTotalPortfolioValue() { return totalPortfolioValue; }
    public BigDecimal getTotalGainLoss() { return totalGainLoss; }
    public BigDecimal getTotalGainLossPercent() { return totalGainLossPercent; }
    public List<HoldingDTO> getHoldings() { return holdings; }
}
