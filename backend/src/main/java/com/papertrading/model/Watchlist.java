package com.papertrading.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "watchlist",
        // One row per user per ticker. Application code checks for an existing
        // entry before inserting, but that check and the insert are not atomic,
        // so two near-simultaneous adds could both pass it. The database is the
        // only place this invariant can actually be enforced.
        uniqueConstraints = @UniqueConstraint(
                name = "uk_watchlist_user_ticker",
                columnNames = {"user_id", "ticker"}
        )
)
public class Watchlist {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String ticker;

    @Column(length = 500)
    private String notes;

    @Column
    private BigDecimal targetPrice;

    @Column(nullable = false)
    private LocalDateTime addedAt;

    public Watchlist() {
        this.id = UUID.randomUUID().toString();
        this.addedAt = LocalDateTime.now();
    }

    public Watchlist(User user, String ticker) {
        this();
        this.user = user;
        this.ticker = ticker;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public BigDecimal getTargetPrice() { return targetPrice; }
    public void setTargetPrice(BigDecimal targetPrice) { this.targetPrice = targetPrice; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
