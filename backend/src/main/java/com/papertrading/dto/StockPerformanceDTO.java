package com.papertrading.dto;

import java.math.BigDecimal;

public class StockPerformanceDTO {
    private String ticker;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPercent;

    public StockPerformanceDTO(String ticker, BigDecimal gainLoss, BigDecimal gainLossPercent) {
        this.ticker = ticker;
        this.gainLoss = gainLoss;
        this.gainLossPercent = gainLossPercent;
    }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public BigDecimal getGainLoss() { return gainLoss; }
    public void setGainLoss(BigDecimal gainLoss) { this.gainLoss = gainLoss; }

    public BigDecimal getGainLossPercent() { return gainLossPercent; }
    public void setGainLossPercent(BigDecimal gainLossPercent) { this.gainLossPercent = gainLossPercent; }
}
