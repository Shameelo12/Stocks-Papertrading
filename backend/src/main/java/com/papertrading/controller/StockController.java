package com.papertrading.controller;

import com.papertrading.dto.StockPriceResponse;
import com.papertrading.service.PolygonService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final PolygonService polygonService;

    public StockController(PolygonService polygonService) {
        this.polygonService = polygonService;
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
}
