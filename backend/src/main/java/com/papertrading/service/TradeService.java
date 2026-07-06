package com.papertrading.service;

import com.papertrading.dto.TradeRequest;
import com.papertrading.model.Holding;
import com.papertrading.model.Transaction;
import com.papertrading.model.User;
import com.papertrading.repository.HoldingRepository;
import com.papertrading.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class TradeService {
    private static final Logger logger = LoggerFactory.getLogger(TradeService.class);

    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final PolygonService polygonService;

    public TradeService(HoldingRepository holdingRepository, TransactionRepository transactionRepository, PolygonService polygonService) {
        this.holdingRepository = holdingRepository;
        this.transactionRepository = transactionRepository;
        this.polygonService = polygonService;
    }

    @Transactional
    public Holding buy(User user, TradeRequest request) {
        String ticker = request.getTicker().toUpperCase();
        BigDecimal shares = request.getShares();

        if (shares.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Shares must be greater than 0");
        }

        Optional<BigDecimal> priceOpt = polygonService.getCurrentPrice(ticker);
        if (priceOpt.isEmpty()) {
            throw new IllegalArgumentException("Could not fetch price for ticker: " + ticker);
        }

        BigDecimal price = priceOpt.get();
        BigDecimal totalCost = price.multiply(shares);

        if (user.getBalance().compareTo(totalCost) < 0) {
            throw new IllegalArgumentException("Insufficient balance. Required: $" + totalCost + ", Available: $" + user.getBalance());
        }

        user.setBalance(user.getBalance().subtract(totalCost));

        Optional<Holding> existingHolding = holdingRepository.findByUserAndTicker(user, ticker);

        Holding holding;
        if (existingHolding.isPresent()) {
            holding = existingHolding.get();
            BigDecimal totalShares = holding.getShares().add(shares);
            BigDecimal newAvgCost = holding.getAvgCostPerShare()
                    .multiply(holding.getShares())
                    .add(price.multiply(shares))
                    .divide(totalShares, 2, java.math.RoundingMode.HALF_UP);

            holding.setShares(totalShares);
            holding.setAvgCostPerShare(newAvgCost);
        } else {
            holding = new Holding(user, ticker, shares, price);
        }

        holding = holdingRepository.save(holding);

        Transaction transaction = new Transaction(user, ticker, Transaction.Type.BUY, shares, price);
        transactionRepository.save(transaction);

        logger.info("BUY transaction: user={}, ticker={}, shares={}, price={}, total={}",
                user.getEmail(), ticker, shares, price, totalCost);

        return holding;
    }

    @Transactional
    public Holding sell(User user, TradeRequest request) {
        String ticker = request.getTicker().toUpperCase();
        BigDecimal shares = request.getShares();

        if (shares.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Shares must be greater than 0");
        }

        Optional<Holding> holdingOpt = holdingRepository.findByUserAndTicker(user, ticker);
        if (holdingOpt.isEmpty()) {
            throw new IllegalArgumentException("You do not own any shares of " + ticker);
        }

        Holding holding = holdingOpt.get();
        if (holding.getShares().compareTo(shares) < 0) {
            throw new IllegalArgumentException("Insufficient shares. You own: " + holding.getShares() + ", Trying to sell: " + shares);
        }

        Optional<BigDecimal> priceOpt = polygonService.getCurrentPrice(ticker);
        if (priceOpt.isEmpty()) {
            throw new IllegalArgumentException("Could not fetch price for ticker: " + ticker);
        }

        BigDecimal price = priceOpt.get();
        BigDecimal totalValue = price.multiply(shares);

        user.setBalance(user.getBalance().add(totalValue));

        BigDecimal remainingShares = holding.getShares().subtract(shares);
        if (remainingShares.compareTo(BigDecimal.ZERO) == 0) {
            holdingRepository.delete(holding);
            holding = null;
        } else {
            holding.setShares(remainingShares);
            holding = holdingRepository.save(holding);
        }

        Transaction transaction = new Transaction(user, ticker, Transaction.Type.SELL, shares, price);
        transactionRepository.save(transaction);

        logger.info("SELL transaction: user={}, ticker={}, shares={}, price={}, total={}",
                user.getEmail(), ticker, shares, price, totalValue);

        return holding;
    }
}
