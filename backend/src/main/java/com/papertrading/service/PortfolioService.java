package com.papertrading.service;

import com.papertrading.dto.HoldingDTO;
import com.papertrading.dto.PortfolioResponse;
import com.papertrading.dto.TransactionDTO;
import com.papertrading.model.Holding;
import com.papertrading.model.User;
import com.papertrading.repository.HoldingRepository;
import com.papertrading.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final PolygonService polygonService;

    public PortfolioService(HoldingRepository holdingRepository,
                           TransactionRepository transactionRepository,
                           PolygonService polygonService) {
        this.holdingRepository = holdingRepository;
        this.transactionRepository = transactionRepository;
        this.polygonService = polygonService;
    }

    public PortfolioResponse getPortfolio(User user) {
        List<Holding> holdings = holdingRepository.findByUser(user);

        BigDecimal investedBalance = BigDecimal.ZERO;
        BigDecimal portfolioValue = BigDecimal.ZERO;
        List<HoldingDTO> holdingDTOs = holdings.stream()
                .map(holding -> {
                    Optional<BigDecimal> priceOpt = polygonService.getCurrentPrice(holding.getTicker());
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
}
