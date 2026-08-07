package com.papertrading.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public class CreatePriceAlertRequest {
    @NotBlank(message = "Ticker is required")
    private String ticker;

    @NotNull(message = "Target price is required")
    @DecimalMin(value = "0.01", message = "Target price must be greater than 0")
    private BigDecimal targetPrice;

    @NotBlank(message = "Alert type is required")
    @Pattern(regexp = "(?i)(ABOVE|BELOW)", message = "Type must be ABOVE or BELOW")
    private String type;

    public CreatePriceAlertRequest() {}

    public CreatePriceAlertRequest(String ticker, BigDecimal targetPrice, String type) {
        this.ticker = ticker;
        this.targetPrice = targetPrice;
        this.type = type;
    }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public BigDecimal getTargetPrice() { return targetPrice; }
    public void setTargetPrice(BigDecimal targetPrice) { this.targetPrice = targetPrice; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
