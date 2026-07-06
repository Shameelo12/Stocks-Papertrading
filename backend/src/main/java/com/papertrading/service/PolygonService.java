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
public class PolygonService {
    private static final Logger logger = LoggerFactory.getLogger(PolygonService.class);

    @Value("${polygon.api.key}")
    private String apiKey;

    @Value("${polygon.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PolygonService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public Optional<BigDecimal> getCurrentPrice(String ticker) {
        try {
            String url = String.format(
                    "%s/v3/quotes/%s?apikey=%s",
                    apiUrl,
                    ticker.toUpperCase(),
                    apiKey
            );

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            if (root.has("results") && root.get("results").isArray() && root.get("results").size() > 0) {
                JsonNode result = root.get("results").get(0);
                if (result.has("last_quote") && result.get("last_quote").has("ask")) {
                    BigDecimal price = new BigDecimal(result.get("last_quote").get("ask").asText());
                    logger.info("Fetched price for {}: {}", ticker, price);
                    return Optional.of(price);
                }
            }

            logger.warn("No price data found for ticker: {}", ticker);
            return Optional.empty();
        } catch (Exception e) {
            logger.error("Error fetching price for ticker {}: {}", ticker, e.getMessage());
            return Optional.empty();
        }
    }
}
