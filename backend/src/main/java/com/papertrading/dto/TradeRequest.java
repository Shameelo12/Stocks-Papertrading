package com.papertrading.dto;

import java.math.BigDecimal;

public class TradeRequest {
    private String ticker;
    private BigDecimal shares;

    public TradeRequest() {}

    public TradeRequest(String ticker, BigDecimal shares) {
        this.ticker = ticker;
        this.shares = shares;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public BigDecimal getShares() {
        return shares;
    }

    public void setShares(BigDecimal shares) {
        this.shares = shares;
    }
}
