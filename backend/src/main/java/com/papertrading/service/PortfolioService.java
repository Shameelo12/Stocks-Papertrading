package com.papertrading.service;

import com.papertrading.dto.HoldingDTO;
import com.papertrading.dto.PortfolioHistoryDTO;
import com.papertrading.dto.PortfolioResponse;
import com.papertrading.dto.TransactionDTO;
import com.papertrading.model.Holding;
import com.papertrading.model.Transaction;
import com.papertrading.model.User;
import com.papertrading.repository.HoldingRepository;
import com.papertrading.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final AlphaVantageService alphaVantageService;

    public PortfolioService(HoldingRepository holdingRepository,
                           TransactionRepository transactionRepository,
                           AlphaVantageService alphaVantageService) {
        this.holdingRepository = holdingRepository;
        this.transactionRepository = transactionRepository;
        this.alphaVantageService = alphaVantageService;
    }

    public PortfolioResponse getPortfolio(User user) {
        List<Holding> holdings = holdingRepository.findByUser(user);

        BigDecimal investedBalance = BigDecimal.ZERO;
        BigDecimal portfolioValue = BigDecimal.ZERO;
        List<HoldingDTO> holdingDTOs = holdings.stream()
                .map(holding -> {
                    Optional<BigDecimal> priceOpt = alphaVantageService.getCurrentPrice(holding.getTicker());
                    BigDecimal price = priceOpt.orElse(holding.getAvgCostPerShare());
                    return new HoldingDTO(holding.getTicker(), holding.getShares(),
                            holding.getAvgCostPerShare(), price);
                })
                .collect(Collectors.toList());

        for (HoldingDTO holding : holdingDTOs) {
            investedBalance = investedBalance.add(holding.getAvgCostPerShare().multiply(holding.getShares()));
            portfolioValue = portfolioValue.add(holding.getCurrentValue());
        }

        BigDecimal totalValue = user.getBalance().add(portfolioValue);
        BigDecimal totalGainLoss = totalValue.subtract(new BigDecimal("10000"));
        BigDecimal totalGainLossPercent = totalGainLoss.divide(new BigDecimal("10000"), 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return new PortfolioResponse(
                user.getBalance(),
                investedBalance,
                totalValue,
                totalGainLoss,
                totalGainLossPercent,
                holdingDTOs
        );
    }

    public List<TransactionDTO> getTransactionHistory(User user) {
        return transactionRepository.findByUserOrderByTimestampDesc(user)
                .stream()
                .map(tx -> new TransactionDTO(tx.getId(), tx.getTicker(), tx.getType(),
                        tx.getShares(), tx.getPriceAtTime(), tx.getTotalValue(), tx.getTimestamp()))
                .collect(Collectors.toList());
    }

    public List<PortfolioHistoryDTO> getPortfolioHistory(User user) {
        List<Transaction> allTransactions = transactionRepository.findByUserOrderByTimestampDesc(user);

        if (allTransactions.isEmpty()) {
            List<PortfolioHistoryDTO> history = new ArrayList<>();
            history.add(new PortfolioHistoryDTO(LocalDateTime.now(), new BigDecimal("10000.00"), user.getBalance(), BigDecimal.ZERO));
            return history;
        }

        List<Transaction> transactions = new ArrayList<>(allTransactions);
        transactions.sort(Comparator.comparing(Transaction::getTimestamp));

        Map<LocalDateTime, PortfolioHistoryDTO> dailyHistory = new TreeMap<>();
        BigDecimal initialBalance = new BigDecimal("10000.00");

        for (Transaction tx : transactions) {
            LocalDateTime dayKey = tx.getTimestamp().truncatedTo(ChronoUnit.DAYS);

            BigDecimal dayBalance = initialBalance;
            Map<String, BigDecimal> holdings = new HashMap<>();

            for (Transaction t : transactions) {
                if (!t.getTimestamp().isBefore(dayKey.plusDays(1))) break;

                if (t.getType() == Transaction.Type.BUY) {
                    dayBalance = dayBalance.subtract(t.getTotalValue());
                    holdings.merge(t.getTicker(), t.getShares(), BigDecimal::add);
                } else {
                    dayBalance = dayBalance.add(t.getTotalValue());
                    holdings.merge(t.getTicker(), t.getShares().negate(), BigDecimal::add);
                }
            }

            BigDecimal investedValue = BigDecimal.ZERO;
            for (Map.Entry<String, BigDecimal> holding : holdings.entrySet()) {
                Optional<BigDecimal> priceOpt = alphaVantageService.getCurrentPrice(holding.getKey());
                BigDecimal price = priceOpt.orElse(BigDecimal.ZERO);
                investedValue = investedValue.add(price.multiply(holding.getValue()));
            }

            BigDecimal portfolioValue = dayBalance.add(investedValue);
            dailyHistory.put(dayKey, new PortfolioHistoryDTO(dayKey, portfolioValue, dayBalance, investedValue));
        }

        List<PortfolioHistoryDTO> history = new ArrayList<>(dailyHistory.values());

        if (history.isEmpty()) {
            history.add(new PortfolioHistoryDTO(LocalDateTime.now(), new BigDecimal("10000.00"), user.getBalance(), BigDecimal.ZERO));
        }

        return history;
    }
}
