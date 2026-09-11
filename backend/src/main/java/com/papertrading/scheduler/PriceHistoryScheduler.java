package com.papertrading.scheduler;

import com.papertrading.service.PriceHistoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Builds the price series over time by sampling the quotes the app already fetches.
 *
 * <p>Snapshots go through PriceService, so a sweep mostly hits the price cache and
 * costs very few upstream calls.
 */
@Component
public class PriceHistoryScheduler {
    private static final Logger logger = LoggerFactory.getLogger(PriceHistoryScheduler.class);

    private final PriceHistoryService historyService;

    public PriceHistoryScheduler(PriceHistoryService historyService) {
        this.historyService = historyService;
    }

    @Scheduled(
            fixedDelayString = "${price.history.snapshot-interval-ms:300000}",
            initialDelayString = "${price.history.snapshot-initial-delay-ms:20000}"
    )
    public void snapshot() {
        try {
            int recorded = historyService.recordSnapshot();
            if (recorded > 0) {
                logger.debug("Recorded {} price point(s)", recorded);
            }
        } catch (Exception e) {
            // An uncaught exception here cancels all future runs of this schedule.
            logger.error("Price snapshot failed; will retry next interval", e);
        }
    }

    /** Retention sweep. Hourly is far more often than needed and costs nothing. */
    @Scheduled(fixedDelayString = "${price.history.prune-interval-ms:3600000}",
               initialDelayString = "${price.history.prune-initial-delay-ms:60000}")
    public void prune() {
        try {
            historyService.prune();
        } catch (Exception e) {
            logger.error("Price history prune failed; will retry next interval", e);
        }
    }
}
