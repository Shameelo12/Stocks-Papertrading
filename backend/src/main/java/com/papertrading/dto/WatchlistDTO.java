package com.papertrading.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WatchlistDTO {
    private String id;
    private String ticker;
    private String notes;
    private BigDecimal targetPrice;
    private BigDecimal currentPrice;
    private LocalDateTime addedAt;

    public WatchlistDTO(String id, String ticker, String notes, BigDecimal targetPrice, BigDecimal currentPrice, LocalDateTime addedAt) {
        this.id = id;
        this.ticker = ticker;
        this.notes = notes;
        this.targetPrice = targetPrice;
        this.currentPrice = currentPrice;
        this.addedAt = addedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public BigDecimal getTargetPrice() { return targetPrice; }
    public void setTargetPrice(BigDecimal targetPrice) { this.targetPrice = targetPrice; }

    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
