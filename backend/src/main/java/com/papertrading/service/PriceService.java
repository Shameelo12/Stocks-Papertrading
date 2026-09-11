package com.papertrading.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class PriceService {
    private static final Logger logger = LoggerFactory.getLogger(PriceService.class);

    private final FinnhubService finnhubService;

    public PriceService(FinnhubService finnhubService) {
        this.finnhubService = finnhubService;
    }

    public Optional<BigDecimal> getCurrentPrice(String ticker) {
        Optional<BigDecimal> price = finnhubService.getCurrentPrice(ticker);
        if (price.isPresent()) {
            return price;
        }

        logger.warn("Finnhub failed for ticker: {}, using mock price", ticker);
        return getFallbackPrice(ticker);
    }

    private Optional<BigDecimal> getFallbackPrice(String ticker) {
        BigDecimal price = MockPriceService.getPrice(ticker);
        if (price != null) {
            logger.info("Using mock price for {}: {}", ticker, price);
            return Optional.of(price);
        }
        return Optional.empty();
    }
}
