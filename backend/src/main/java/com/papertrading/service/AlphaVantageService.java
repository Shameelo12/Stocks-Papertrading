package com.papertrading.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class AlphaVantageService {
    private static final Logger logger = LoggerFactory.getLogger(AlphaVantageService.class);

    @Value("${alpha.vantage.api.key}")
    private String apiKey;

    @Value("${alpha.vantage.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AlphaVantageService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public Optional<BigDecimal> getCurrentPrice(String ticker) {
        try {
            String url = String.format(
                    "%s?function=GLOBAL_QUOTE&symbol=%s&apikey=%s",
                    apiUrl,
                    ticker.toUpperCase(),
                    apiKey
            );

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            if (root.has("Global Quote")) {
                JsonNode quote = root.get("Global Quote");
                if (quote.has("05. price") && !quote.get("05. price").asText().isEmpty()) {
                    BigDecimal price = new BigDecimal(quote.get("05. price").asText());
                    logger.info("Fetched price for {}: {}", ticker, price);
                    return Optional.of(price);
                }
            }

            logger.warn("No price data found for ticker: {}", ticker);
            return getFallbackPrice(ticker);
        } catch (Exception e) {
            logger.error("Error fetching price for ticker {}: {}", ticker, e.getMessage());
            return getFallbackPrice(ticker);
        }
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
