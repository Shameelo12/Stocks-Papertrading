package com.papertrading.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TradeRequest {
    @NotBlank(message = "Ticker is required")
    private String ticker;

    @NotNull(message = "Shares is required")
    @DecimalMin(value = "0.01", message = "Shares must be greater than 0")
    private BigDecimal shares;

    public TradeRequest() {}

    public TradeRequest(String ticker, BigDecimal shares) {
        this.ticker = ticker;
        this.shares = shares;
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
}
