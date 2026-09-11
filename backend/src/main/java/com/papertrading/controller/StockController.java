package com.papertrading.controller;

import com.papertrading.dto.PricePointDTO;
import com.papertrading.dto.StockPriceResponse;
import com.papertrading.dto.StockSuggestion;
import com.papertrading.service.PriceHistoryService;
import com.papertrading.service.PriceService;
import com.papertrading.service.StockSearchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final PriceService priceService;
    private final StockSearchService stockSearchService;
    private final PriceHistoryService priceHistoryService;

    public StockController(PriceService priceService,
                           StockSearchService stockSearchService,
                           PriceHistoryService priceHistoryService) {
        this.priceService = priceService;
        this.stockSearchService = stockSearchService;
        this.priceHistoryService = priceHistoryService;
    }

    @GetMapping("/{ticker}/price")
    public ResponseEntity<StockPriceResponse> getPrice(@PathVariable String ticker) {
        var price = priceService.getCurrentPrice(ticker);

        if (price.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        StockPriceResponse response = new StockPriceResponse(
                ticker.toUpperCase(),
                price.get(),
                System.currentTimeMillis()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Recorded price points for a ticker over the trailing {@code days}.
     *
     * <p>The series is built by this application rather than fetched: Finnhub's
     * free tier does not expose historical candles. It is seeded from the trades
     * already in the transaction log and extended by a periodic snapshot, so a
     * newly tracked ticker starts sparse and fills in over time.
     */
    @GetMapping("/{ticker}/history")
    public ResponseEntity<List<PricePointDTO>> getHistory(
            @PathVariable String ticker,
            @RequestParam(defaultValue = "30") int days) {
        int window = Math.min(Math.max(days, 1), 365);
        return ResponseEntity.ok(priceHistoryService.getHistory(ticker, window));
    }

    @GetMapping("/search")
    public ResponseEntity<StockPriceResponse> search(@RequestParam String q) {
        return getPrice(q);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<StockSuggestion>> getSuggestions(@RequestParam(required = false) String q) {
        List<StockSuggestion> suggestions = stockSearchService.searchStocks(q);
        return ResponseEntity.ok(suggestions);
    }
}
