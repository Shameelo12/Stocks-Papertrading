package com.papertrading.dto;

import java.math.BigDecimal;

public class StockPriceResponse {
    private String ticker;
    private BigDecimal price;
    private long timestamp;

    public StockPriceResponse() {}

    public StockPriceResponse(String ticker, BigDecimal price, long timestamp) {
        this.ticker = ticker;
        this.price = price;
        this.timestamp = timestamp;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
