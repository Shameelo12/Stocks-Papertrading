package com.papertrading.service;

import com.papertrading.model.PriceAlert;
import com.papertrading.repository.PriceAlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Decides which waiting price alerts have been met.
 *
 * <p>Kept separate from the scheduler that drives it so the rule can be tested
 * directly, without waiting on a timer.
 */
@Service
public class PriceAlertEvaluator {
    private static final Logger logger = LoggerFactory.getLogger(PriceAlertEvaluator.class);

    private final PriceAlertRepository alertRepository;
    private final PriceService priceService;

    public PriceAlertEvaluator(PriceAlertRepository alertRepository, PriceService priceService) {
        this.alertRepository = alertRepository;
        this.priceService = priceService;
    }

    /**
     * Checks every active alert and fires the ones whose condition now holds.
     *
     * @return how many alerts fired on this pass
     */
    @Transactional
    public int evaluateAll() {
        List<PriceAlert> active = alertRepository.findByActive(true);
        if (active.isEmpty()) {
            return 0;
        }

        // Group by ticker so each distinct symbol costs one price lookup no matter
        // how many alerts watch it — fifty alerts on AAPL is still one resolution.
        Map<String, List<PriceAlert>> byTicker = active.stream()
                .collect(Collectors.groupingBy(alert -> alert.getTicker().toUpperCase()));

        List<PriceAlert> fired = new ArrayList<>();

        for (Map.Entry<String, List<PriceAlert>> entry : byTicker.entrySet()) {
            String ticker = entry.getKey();
            Optional<BigDecimal> priceOpt = priceService.getCurrentPrice(ticker);

            if (priceOpt.isEmpty()) {
                // No price is not a reason to fire. Leave these alerts waiting.
                logger.warn("No price for {}; leaving {} alert(s) pending", ticker, entry.getValue().size());
                continue;
            }

            BigDecimal price = priceOpt.get();
            LocalDateTime now = LocalDateTime.now();

            for (PriceAlert alert : entry.getValue()) {
                if (alert.isTriggeredBy(price)) {
                    alert.setActive(false);
                    alert.setTriggeredAt(now);
                    fired.add(alert);

                    logger.info("Alert {} fired: {} {} {} (price {})",
                            alert.getId(), ticker, alert.getType(), alert.getTargetPrice(), price);
                }
            }
        }

        if (!fired.isEmpty()) {
            alertRepository.saveAll(fired);
        }
        return fired.size();
    }
}
