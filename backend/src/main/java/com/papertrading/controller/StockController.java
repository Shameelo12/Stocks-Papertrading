package com.papertrading.controller;

import com.papertrading.dto.StockPriceResponse;
import com.papertrading.dto.StockSuggestion;
import com.papertrading.service.PolygonService;
import com.papertrading.service.StockSearchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final PolygonService polygonService;
    private final StockSearchService stockSearchService;

    public StockController(PolygonService polygonService, StockSearchService stockSearchService) {
        this.polygonService = polygonService;
        this.stockSearchService = stockSearchService;
    }

    @GetMapping("/{ticker}/price")
    public ResponseEntity<StockPriceResponse> getPrice(@PathVariable String ticker) {
        var price = polygonService.getCurrentPrice(ticker);

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
