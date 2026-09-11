package com.papertrading.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private BigDecimal balance;

    /**
     * Optimistic lock guard on the cash balance.
     *
     * <p>Without this, two concurrent trades could each read the same balance,
     * each pass their own affordability check, and both commit — overdrawing the
     * account. Hibernate appends {@code AND version = ?} to every update and bumps
     * the value, so the second writer updates zero rows and fails instead of
     * silently clobbering the first.
     *
     * <p>Optimistic rather than pessimistic locking because conflicts are rare:
     * the contending writes are nearly always the same user in two tabs, not
     * sustained contention worth holding a row lock for.
     */
    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public User() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.balance = new BigDecimal("10000.00");
    }

    public User(String email, String passwordHash) {
        this();
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public Long getVersion() {
        return version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
