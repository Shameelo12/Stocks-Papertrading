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
                // Parse from the raw JSON text, not asDouble(). new BigDecimal(double)
                // captures the exact binary value of the float — 234.80 becomes
                // 234.80000000000001136868377216160297393798828125 — and that error
                // then multiplies through every share-count calculation.
                BigDecimal price = new BigDecimal(root.get("c").asText());

                // Finnhub returns c=0 for symbols it does not recognise. Treating that
                // as a real quote would let a user "buy" an unknown ticker for nothing.
                if (price.signum() <= 0) {
                    logger.warn("Finnhub returned a non-positive price for ticker: {}", ticker);
                    return Optional.empty();
                }

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
