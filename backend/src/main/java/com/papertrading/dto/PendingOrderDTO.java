package com.papertrading.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PendingOrderDTO {
    private String id;
    private String ticker;
    private String type;
    private BigDecimal shares;
    private BigDecimal limitPrice;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime executedAt;

    public PendingOrderDTO(String id, String ticker, String type, BigDecimal shares, BigDecimal limitPrice,
                          String status, LocalDateTime createdAt, LocalDateTime executedAt) {
        this.id = id;
        this.ticker = ticker;
        this.type = type;
        this.shares = shares;
        this.limitPrice = limitPrice;
        this.status = status;
        this.createdAt = createdAt;
        this.executedAt = executedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getShares() { return shares; }
    public void setShares(BigDecimal shares) { this.shares = shares; }

    public BigDecimal getLimitPrice() { return limitPrice; }
    public void setLimitPrice(BigDecimal limitPrice) { this.limitPrice = limitPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
}
