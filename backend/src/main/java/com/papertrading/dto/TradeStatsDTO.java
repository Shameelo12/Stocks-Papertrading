package com.papertrading.dto;

import java.math.BigDecimal;
import java.util.List;

public class TradeStatsDTO {
    private int totalTrades;
    private int winningTrades;
    private int losingTrades;
    private BigDecimal winRate;
    private BigDecimal avgGainPerTrade;
    private BigDecimal avgLossPerTrade;
    private BigDecimal largestWin;
    private BigDecimal largestLoss;
    private List<StockPerformanceDTO> bestPerformers;
    private List<StockPerformanceDTO> worstPerformers;

    public TradeStatsDTO() {}

    public TradeStatsDTO(int totalTrades, int winningTrades, int losingTrades, BigDecimal winRate,
                        BigDecimal avgGainPerTrade, BigDecimal avgLossPerTrade,
                        BigDecimal largestWin, BigDecimal largestLoss,
                        List<StockPerformanceDTO> bestPerformers, List<StockPerformanceDTO> worstPerformers) {
        this.totalTrades = totalTrades;
        this.winningTrades = winningTrades;
        this.losingTrades = losingTrades;
        this.winRate = winRate;
        this.avgGainPerTrade = avgGainPerTrade;
        this.avgLossPerTrade = avgLossPerTrade;
        this.largestWin = largestWin;
        this.largestLoss = largestLoss;
        this.bestPerformers = bestPerformers;
        this.worstPerformers = worstPerformers;
    }

    public int getTotalTrades() { return totalTrades; }
    public void setTotalTrades(int totalTrades) { this.totalTrades = totalTrades; }

    public int getWinningTrades() { return winningTrades; }
    public void setWinningTrades(int winningTrades) { this.winningTrades = winningTrades; }

    public int getLosingTrades() { return losingTrades; }
    public void setLosingTrades(int losingTrades) { this.losingTrades = losingTrades; }

    public BigDecimal getWinRate() { return winRate; }
    public void setWinRate(BigDecimal winRate) { this.winRate = winRate; }

    public BigDecimal getAvgGainPerTrade() { return avgGainPerTrade; }
    public void setAvgGainPerTrade(BigDecimal avgGainPerTrade) { this.avgGainPerTrade = avgGainPerTrade; }

    public BigDecimal getAvgLossPerTrade() { return avgLossPerTrade; }
    public void setAvgLossPerTrade(BigDecimal avgLossPerTrade) { this.avgLossPerTrade = avgLossPerTrade; }

    public BigDecimal getLargestWin() { return largestWin; }
    public void setLargestWin(BigDecimal largestWin) { this.largestWin = largestWin; }

    public BigDecimal getLargestLoss() { return largestLoss; }
    public void setLargestLoss(BigDecimal largestLoss) { this.largestLoss = largestLoss; }

    public List<StockPerformanceDTO> getBestPerformers() { return bestPerformers; }
    public void setBestPerformers(List<StockPerformanceDTO> bestPerformers) { this.bestPerformers = bestPerformers; }

    public List<StockPerformanceDTO> getWorstPerformers() { return worstPerformers; }
    public void setWorstPerformers(List<StockPerformanceDTO> worstPerformers) { this.worstPerformers = worstPerformers; }
}
