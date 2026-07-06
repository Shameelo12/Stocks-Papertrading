package com.papertrading.dto;

import java.math.BigDecimal;

public class TradeResponse {
    private String ticker;
    private BigDecimal shares;
    private BigDecimal price;
    private BigDecimal balance;
    private String message;

    public TradeResponse(String ticker, BigDecimal shares, BigDecimal price, BigDecimal balance, String message) {
        this.ticker = ticker;
        this.shares = shares;
        this.price = price;
        this.balance = balance;
        this.message = message;
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

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
