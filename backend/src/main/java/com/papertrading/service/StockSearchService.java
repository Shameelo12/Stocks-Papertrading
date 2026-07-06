package com.papertrading.service;

import com.papertrading.dto.StockSuggestion;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockSearchService {

    private static final List<StockSuggestion> POPULAR_STOCKS = Arrays.asList(
        new StockSuggestion("AAPL", "Apple Inc."),
        new StockSuggestion("GOOGL", "Alphabet Inc."),
        new StockSuggestion("MSFT", "Microsoft Corporation"),
        new StockSuggestion("AMZN", "Amazon.com Inc."),
        new StockSuggestion("NVDA", "NVIDIA Corporation"),
        new StockSuggestion("TSLA", "Tesla Inc."),
        new StockSuggestion("META", "Meta Platforms Inc."),
        new StockSuggestion("NFLX", "Netflix Inc."),
        new StockSuggestion("AVGO", "Broadcom Inc."),
        new StockSuggestion("ASML", "ASML Holding N.V."),
        new StockSuggestion("COST", "Costco Wholesale Corp."),
        new StockSuggestion("ADBE", "Adobe Inc."),
        new StockSuggestion("CSCO", "Cisco Systems Inc."),
        new StockSuggestion("AMD", "Advanced Micro Devices"),
        new StockSuggestion("IBM", "IBM Corporation"),
        new StockSuggestion("INTC", "Intel Corporation"),
        new StockSuggestion("BA", "Boeing Company"),
        new StockSuggestion("JPM", "JPMorgan Chase & Co."),
        new StockSuggestion("V", "Visa Inc."),
        new StockSuggestion("MA", "Mastercard Inc."),
        new StockSuggestion("WMT", "Walmart Inc."),
        new StockSuggestion("PG", "Procter & Gamble Co."),
        new StockSuggestion("JNJ", "Johnson & Johnson"),
        new StockSuggestion("KO", "The Coca-Cola Company"),
        new StockSuggestion("XOM", "Exxon Mobil Corporation")
    );

    public List<StockSuggestion> searchStocks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return POPULAR_STOCKS.stream().limit(10).collect(Collectors.toList());
        }

        String lowerQuery = query.toLowerCase().trim();
        return POPULAR_STOCKS.stream()
            .filter(stock ->
                stock.getTicker().toLowerCase().contains(lowerQuery) ||
                stock.getName().toLowerCase().contains(lowerQuery)
            )
            .limit(8)
            .collect(Collectors.toList());
    }
}
