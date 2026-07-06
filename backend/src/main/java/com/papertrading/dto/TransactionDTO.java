package com.papertrading.dto;

import com.papertrading.model.Transaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDTO {
    private String id;
    private String ticker;
    private Transaction.Type type;
    private BigDecimal shares;
    private BigDecimal priceAtTime;
    private BigDecimal totalValue;
    private LocalDateTime timestamp;

    public TransactionDTO() {}

    public TransactionDTO(String id, String ticker, Transaction.Type type,
                        BigDecimal shares, BigDecimal priceAtTime,
                        BigDecimal totalValue, LocalDateTime timestamp) {
        this.id = id;
        this.ticker = ticker;
        this.type = type;
        this.shares = shares;
        this.priceAtTime = priceAtTime;
        this.totalValue = totalValue;
        this.timestamp = timestamp;
    }

    // Getters
    public String getId() { return id; }
    public String getTicker() { return ticker; }
    public Transaction.Type getType() { return type; }
    public BigDecimal getShares() { return shares; }
    public BigDecimal getPriceAtTime() { return priceAtTime; }
    public BigDecimal getTotalValue() { return totalValue; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
