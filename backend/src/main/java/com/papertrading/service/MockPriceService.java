package com.papertrading.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class MockPriceService {
    private static final Map<String, BigDecimal> MOCK_PRICES = new HashMap<>();

    static {
        MOCK_PRICES.put("AAPL", new BigDecimal("234.80"));
        MOCK_PRICES.put("GOOGL", new BigDecimal("198.45"));
        MOCK_PRICES.put("MSFT", new BigDecimal("468.25"));
        MOCK_PRICES.put("AMZN", new BigDecimal("212.75"));
        MOCK_PRICES.put("NVDA", new BigDecimal("142.30"));
        MOCK_PRICES.put("TSLA", new BigDecimal("268.50"));
        MOCK_PRICES.put("META", new BigDecimal("548.15"));
        MOCK_PRICES.put("NFLX", new BigDecimal("625.40"));
        MOCK_PRICES.put("AVGO", new BigDecimal("175.65"));
        MOCK_PRICES.put("ASML", new BigDecimal("925.20"));
        MOCK_PRICES.put("COST", new BigDecimal("875.55"));
        MOCK_PRICES.put("ADBE", new BigDecimal("645.30"));
        MOCK_PRICES.put("CSCO", new BigDecimal("58.75"));
        MOCK_PRICES.put("AMD", new BigDecimal("185.90"));
        MOCK_PRICES.put("IBM", new BigDecimal("192.25"));
        MOCK_PRICES.put("INTC", new BigDecimal("52.80"));
        MOCK_PRICES.put("BA", new BigDecimal("205.35"));
        MOCK_PRICES.put("JPM", new BigDecimal("218.60"));
        MOCK_PRICES.put("V", new BigDecimal("315.40"));
        MOCK_PRICES.put("MA", new BigDecimal("495.75"));
        MOCK_PRICES.put("WMT", new BigDecimal("98.95"));
        MOCK_PRICES.put("PG", new BigDecimal("182.20"));
        MOCK_PRICES.put("JNJ", new BigDecimal("175.75"));
        MOCK_PRICES.put("KO", new BigDecimal("68.45"));
        MOCK_PRICES.put("XOM", new BigDecimal("128.30"));
    }

    public static BigDecimal getPrice(String ticker) {
        return MOCK_PRICES.getOrDefault(ticker.toUpperCase(), null);
    }
}
