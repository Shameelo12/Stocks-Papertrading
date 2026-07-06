package com.papertrading.dto;

import java.math.BigDecimal;

public class CreateLimitOrderRequest {
    private String ticker;
    private String type; // BUY or SELL
    private BigDecimal shares;
    private BigDecimal limitPrice;

    public CreateLimitOrderRequest() {}

    public CreateLimitOrderRequest(String ticker, String type, BigDecimal shares, BigDecimal limitPrice) {
        this.ticker = ticker;
        this.type = type;
        this.shares = shares;
        this.limitPrice = limitPrice;
    }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getShares() { return shares; }
    public void setShares(BigDecimal shares) { this.shares = shares; }

    public BigDecimal getLimitPrice() { return limitPrice; }
    public void setLimitPrice(BigDecimal limitPrice) { this.limitPrice = limitPrice; }
}
