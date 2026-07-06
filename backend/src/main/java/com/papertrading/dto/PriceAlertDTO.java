package com.papertrading.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PriceAlertDTO {
    private String id;
    private String ticker;
    private BigDecimal targetPrice;
    private String type;
    private boolean active;
    private LocalDateTime createdAt;

    public PriceAlertDTO(String id, String ticker, BigDecimal targetPrice, String type, boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.ticker = ticker;
        this.targetPrice = targetPrice;
        this.type = type;
        this.active = active;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public BigDecimal getTargetPrice() { return targetPrice; }
    public void setTargetPrice(BigDecimal targetPrice) { this.targetPrice = targetPrice; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
