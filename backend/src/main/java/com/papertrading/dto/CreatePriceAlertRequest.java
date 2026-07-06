package com.papertrading.dto;

import java.math.BigDecimal;

public class CreatePriceAlertRequest {
    private String ticker;
    private BigDecimal targetPrice;
    private String type; // ABOVE or BELOW

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
