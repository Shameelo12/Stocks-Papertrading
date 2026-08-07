package com.papertrading.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public class CreateLimitOrderRequest {
    @NotBlank(message = "Ticker is required")
    private String ticker;

    @NotBlank(message = "Order type is required")
    @Pattern(regexp = "(?i)(BUY|SELL)", message = "Type must be BUY or SELL")
    private String type;

    @NotNull(message = "Shares is required")
    @DecimalMin(value = "0.01", message = "Shares must be greater than 0")
    private BigDecimal shares;

    @NotNull(message = "Limit price is required")
    @DecimalMin(value = "0.01", message = "Limit price must be greater than 0")
    private BigDecimal limitPrice;

    public CreateLimitOrderRequest() {}

    public CreateLimitOrderRequest(String ticker, String type, BigDecimal shares, BigDecimal limitPrice) {
        this.ticker = ticker;
        this.type = type;
        this.shares = shares;
        this.limitPrice = limitPrice;
    }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getShares() { return shares; }
    public void setShares(BigDecimal shares) { this.shares = shares; }

    public BigDecimal getLimitPrice() { return limitPrice; }
    public void setLimitPrice(BigDecimal limitPrice) { this.limitPrice = limitPrice; }
}
