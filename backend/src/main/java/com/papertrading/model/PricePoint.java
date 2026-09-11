package com.papertrading.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * One observed price for a ticker at a point in time.
 *
 * <p>Deliberately not tied to a user: a price is a property of the market, not of
 * whoever happened to look at it, so one series serves every account.
 */
@Entity
@Table(name = "price_history")
public class PricePoint {

    @Id
    private String id;

    @Column(nullable = false)
    private String ticker;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    public PricePoint() {
        this.id = UUID.randomUUID().toString();
        this.recordedAt = LocalDateTime.now();
    }

    public PricePoint(String ticker, BigDecimal price) {
        this();
        this.ticker = ticker;
        this.price = price;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
