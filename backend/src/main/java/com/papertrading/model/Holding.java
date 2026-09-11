package com.papertrading.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(
        name = "holdings",
        // A user holds exactly one position per ticker; TradeService relies on
        // findByUserAndTicker returning at most one row. Nothing enforced that at
        // the schema level, so a race between two first-time buys of the same
        // ticker could create a duplicate and silently split the position.
        uniqueConstraints = @UniqueConstraint(
                name = "uk_holdings_user_ticker",
                columnNames = {"user_id", "ticker"}
        )
)
public class Holding {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String ticker;

    @Column(nullable = false)
    private BigDecimal shares;

    @Column(nullable = false)
    private BigDecimal avgCostPerShare;

    public Holding() {
        this.id = UUID.randomUUID().toString();
    }

    public Holding(User user, String ticker, BigDecimal shares, BigDecimal avgCostPerShare) {
        this();
        this.user = user;
        this.ticker = ticker;
        this.shares = shares;
        this.avgCostPerShare = avgCostPerShare;
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public BigDecimal getAvgCostPerShare() {
        return avgCostPerShare;
    }

    public void setAvgCostPerShare(BigDecimal avgCostPerShare) {
        this.avgCostPerShare = avgCostPerShare;
    }
}
