package com.papertrading.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class MockPriceService {
    private static final Map<String, BigDecimal> MOCK_PRICES = new HashMap<>();

    static {
        MOCK_PRICES.put("AAPL", new BigDecimal("226.50"));
        MOCK_PRICES.put("GOOGL", new BigDecimal("187.45"));
        MOCK_PRICES.put("MSFT", new BigDecimal("440.25"));
        MOCK_PRICES.put("AMZN", new BigDecimal("198.75"));
        MOCK_PRICES.put("NVDA", new BigDecimal("875.30"));
        MOCK_PRICES.put("TSLA", new BigDecimal("245.50"));
        MOCK_PRICES.put("META", new BigDecimal("502.15"));
        MOCK_PRICES.put("NFLX", new BigDecimal("582.40"));
        MOCK_PRICES.put("AVGO", new BigDecimal("158.65"));
        MOCK_PRICES.put("ASML", new BigDecimal("892.20"));
        MOCK_PRICES.put("COST", new BigDecimal("834.55"));
        MOCK_PRICES.put("ADBE", new BigDecimal("612.30"));
        MOCK_PRICES.put("CSCO", new BigDecimal("52.75"));
        MOCK_PRICES.put("AMD", new BigDecimal("168.90"));
        MOCK_PRICES.put("IBM", new BigDecimal("175.25"));
        MOCK_PRICES.put("INTC", new BigDecimal("45.80"));
        MOCK_PRICES.put("BA", new BigDecimal("186.35"));
        MOCK_PRICES.put("JPM", new BigDecimal("198.60"));
        MOCK_PRICES.put("V", new BigDecimal("285.40"));
        MOCK_PRICES.put("MA", new BigDecimal("456.75"));
        MOCK_PRICES.put("WMT", new BigDecimal("88.95"));
        MOCK_PRICES.put("PG", new BigDecimal("164.20"));
        MOCK_PRICES.put("JNJ", new BigDecimal("158.75"));
        MOCK_PRICES.put("KO", new BigDecimal("60.45"));
        MOCK_PRICES.put("XOM", new BigDecimal("112.30"));
    }

    public static BigDecimal getPrice(String ticker) {
        return MOCK_PRICES.getOrDefault(ticker.toUpperCase(), null);
    }
}
