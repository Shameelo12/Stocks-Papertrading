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
public class FinnhubService {
    private static final Logger logger = LoggerFactory.getLogger(FinnhubService.class);

    @Value("${finnhub.api.key}")
    private String apiKey;

    @Value("${finnhub.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public FinnhubService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public Optional<BigDecimal> getCurrentPrice(String ticker) {
        try {
            String url = String.format(
                    "%s/quote?symbol=%s&token=%s",
                    apiUrl,
                    ticker.toUpperCase(),
                    apiKey
            );

            String response = restTemplate.getForObject(url, String.class);
            if (response == null) {
                logger.warn("Null response from Finnhub for ticker: {}", ticker);
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response);

            if (root.has("c") && !root.get("c").isNull()) {
                BigDecimal price = new BigDecimal(root.get("c").asDouble());
                logger.info("Fetched price for {} from Finnhub: {}", ticker, price);
                return Optional.of(price);
            }

            logger.warn("No price data found for ticker: {} from Finnhub", ticker);
            return Optional.empty();
        } catch (Exception e) {
            logger.error("Error fetching price for ticker {} from Finnhub: {}", ticker, e.getMessage());
            return Optional.empty();
        }
    }
}
