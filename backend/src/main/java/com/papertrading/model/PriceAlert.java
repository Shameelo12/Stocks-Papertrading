package com.papertrading.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "price_alerts")
public class PriceAlert {

    public enum AlertType {
        ABOVE, BELOW
    }

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String ticker;

    @Column(nullable = false)
    private BigDecimal targetPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType type;

    /** False once the alert has fired. A fired alert is kept for history, not deleted. */
    @Column(nullable = false)
    private boolean active = true;

    /** When the price condition was met. Null while the alert is still waiting. */
    @Column
    private LocalDateTime triggeredAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public PriceAlert() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
    }

    public PriceAlert(User user, String ticker, BigDecimal targetPrice, AlertType type) {
        this();
        this.user = user;
        this.ticker = ticker;
        this.targetPrice = targetPrice;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public BigDecimal getTargetPrice() { return targetPrice; }
    public void setTargetPrice(BigDecimal targetPrice) { this.targetPrice = targetPrice; }

    public AlertType getType() { return type; }
    public void setType(AlertType type) { this.type = type; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getTriggeredAt() { return triggeredAt; }
    public void setTriggeredAt(LocalDateTime triggeredAt) { this.triggeredAt = triggeredAt; }

    /**
     * Whether {@code currentPrice} satisfies this alert's condition.
     *
     * <p>Lives on the entity because it is a property of the alert itself, and
     * keeping it here means the rule is stated exactly once.
     */
    public boolean isTriggeredBy(BigDecimal currentPrice) {
        return type == AlertType.ABOVE
                ? currentPrice.compareTo(targetPrice) >= 0
                : currentPrice.compareTo(targetPrice) <= 0;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
