package com.papertrading.scheduler;

import com.papertrading.service.PriceAlertEvaluator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Drives price alert evaluation on a timer.
 *
 * <p>Before this existed, alerts could be created, listed and deleted but nothing
 * ever checked them — the feature was storage with no behaviour behind it.
 *
 * <p>Deliberately thin: it owns the schedule and nothing else, so the decision
 * logic in {@link PriceAlertEvaluator} stays testable without a running context.
 */
@Component
public class PriceAlertScheduler {
    private static final Logger logger = LoggerFactory.getLogger(PriceAlertScheduler.class);

    private final PriceAlertEvaluator evaluator;

    public PriceAlertScheduler(PriceAlertEvaluator evaluator) {
        this.evaluator = evaluator;
    }

    /**
     * {@code fixedDelay} rather than {@code fixedRate}: the gap is measured from the
     * end of the previous run, so a slow pass cannot cause overlapping executions
     * that evaluate the same alerts twice.
     */
    @Scheduled(
            fixedDelayString = "${alerts.evaluation-interval-ms:60000}",
            initialDelayString = "${alerts.evaluation-initial-delay-ms:10000}"
    )
    public void evaluateAlerts() {
        try {
            int fired = evaluator.evaluateAll();
            if (fired > 0) {
                logger.info("Price alert sweep fired {} alert(s)", fired);
            }
        } catch (Exception e) {
            // Never let a failed sweep kill the scheduled task: an uncaught exception
            // from a @Scheduled method cancels all future runs of that schedule.
            logger.error("Price alert sweep failed; will retry next interval", e);
        }
    }
}
