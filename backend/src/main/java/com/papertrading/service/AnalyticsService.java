package com.papertrading.service;

import com.papertrading.dto.StockPerformanceDTO;
import com.papertrading.dto.TradeStatsDTO;
import com.papertrading.model.Holding;
import com.papertrading.model.User;
import com.papertrading.repository.HoldingRepository;
import com.papertrading.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final AlphaVantageService alphaVantageService;

    public AnalyticsService(HoldingRepository holdingRepository,
                           TransactionRepository transactionRepository,
                           AlphaVantageService alphaVantageService) {
        this.holdingRepository = holdingRepository;
        this.transactionRepository = transactionRepository;
        this.alphaVantageService = alphaVantageService;
    }

    public TradeStatsDTO getTradeStats(User user) {
        List<Holding> holdings = holdingRepository.findByUser(user);

        Map<String, StockStats> statsMap = new HashMap<>();
        BigDecimal totalGain = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;
        int winningTrades = 0;
        int losingTrades = 0;
        BigDecimal largestWin = BigDecimal.ZERO;
        BigDecimal largestLoss = BigDecimal.ZERO;

        for (Holding holding : holdings) {
            BigDecimal currentPrice = alphaVantageService.getCurrentPrice(holding.getTicker())
                    .orElse(holding.getAvgCostPerShare());
            BigDecimal currentValue = holding.getShares().multiply(currentPrice);
            BigDecimal gainLoss = currentValue.subtract(holding.getShares().multiply(holding.getAvgCostPerShare()));
            BigDecimal gainLossPercent = gainLoss.divide(
                    holding.getShares().multiply(holding.getAvgCostPerShare()),
                    4, java.math.RoundingMode.HALF_UP
            ).multiply(new BigDecimal("100"));

            statsMap.put(holding.getTicker(), new StockStats(gainLoss, gainLossPercent));

            if (gainLoss.compareTo(BigDecimal.ZERO) > 0) {
                winningTrades++;
                totalGain = totalGain.add(gainLoss);
                if (gainLoss.compareTo(largestWin) > 0) {
                    largestWin = gainLoss;
                }
            } else if (gainLoss.compareTo(BigDecimal.ZERO) < 0) {
                losingTrades++;
                totalLoss = totalLoss.add(gainLoss);
                if (gainLoss.compareTo(largestLoss) < 0) {
                    largestLoss = gainLoss;
                }
            }
        }

        int totalTrades = winningTrades + losingTrades;
        BigDecimal winRate = totalTrades > 0
                ? new BigDecimal(winningTrades).divide(new BigDecimal(totalTrades), 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        BigDecimal avgGain = winningTrades > 0
                ? totalGain.divide(new BigDecimal(winningTrades), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal avgLoss = losingTrades > 0
                ? totalLoss.divide(new BigDecimal(losingTrades), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<StockPerformanceDTO> bestPerformers = statsMap.entrySet().stream()
                .sorted((a, b) -> b.getValue().gainLoss.compareTo(a.getValue().gainLoss))
                .limit(3)
                .map(e -> new StockPerformanceDTO(e.getKey(), e.getValue().gainLoss, e.getValue().gainLossPercent))
                .collect(Collectors.toList());

        List<StockPerformanceDTO> worstPerformers = statsMap.entrySet().stream()
                .sorted((a, b) -> a.getValue().gainLoss.compareTo(b.getValue().gainLoss))
                .limit(3)
                .map(e -> new StockPerformanceDTO(e.getKey(), e.getValue().gainLoss, e.getValue().gainLossPercent))
                .collect(Collectors.toList());

        return new TradeStatsDTO(totalTrades, winningTrades, losingTrades, winRate,
                avgGain, avgLoss, largestWin, largestLoss, bestPerformers, worstPerformers);
    }

    private static class StockStats {
        BigDecimal gainLoss;
        BigDecimal gainLossPercent;

        StockStats(BigDecimal gainLoss, BigDecimal gainLossPercent) {
            this.gainLoss = gainLoss;
            this.gainLossPercent = gainLossPercent;
        }
    }
}
