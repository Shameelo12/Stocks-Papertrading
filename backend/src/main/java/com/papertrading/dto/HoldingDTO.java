package com.papertrading.dto;

import java.math.BigDecimal;

public class HoldingDTO {
    private String ticker;
    private BigDecimal shares;
    private BigDecimal avgCostPerShare;
    private BigDecimal currentPrice;
    private BigDecimal currentValue;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPercent;

    public HoldingDTO() {}

    public HoldingDTO(String ticker, BigDecimal shares, BigDecimal avgCostPerShare,
                     BigDecimal currentPrice) {
        this.ticker = ticker;
        this.shares = shares;
        this.avgCostPerShare = avgCostPerShare;
        this.currentPrice = currentPrice;
        this.currentValue = currentPrice.multiply(shares);
        BigDecimal totalCost = avgCostPerShare.multiply(shares);
        this.gainLoss = currentValue.subtract(totalCost);
        this.gainLossPercent = gainLoss.divide(totalCost, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    // Getters
    public String getTicker() { return ticker; }
    public BigDecimal getShares() { return shares; }
    public BigDecimal getAvgCostPerShare() { return avgCostPerShare; }
    public BigDecimal getCurrentPrice() { return currentPrice; }
    public BigDecimal getCurrentValue() { return currentValue; }
    public BigDecimal getGainLoss() { return gainLoss; }
    public BigDecimal getGainLossPercent() { return gainLossPercent; }
}
