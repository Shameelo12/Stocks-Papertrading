package com.papertrading.repository;

import com.papertrading.model.PricePoint;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PricePointRepository extends JpaRepository<PricePoint, String> {

    /** Points for one ticker since a cutoff, oldest first so a chart can plot them directly. */
    List<PricePoint> findByTickerAndRecordedAtAfterOrderByRecordedAtAsc(String ticker, LocalDateTime after);

    /** Most recent points for a ticker, used to avoid storing a duplicate of the last value. */
    List<PricePoint> findByTickerOrderByRecordedAtDesc(String ticker, Pageable pageable);

    /**
     * Distinct tickers worth recording: anything currently held or watchlisted.
     *
     * <p>Bounds the snapshot job to symbols someone actually cares about, rather
     * than every ticker ever mentioned.
     */
    // Native: JPQL has no UNION.
    @Query(value = """
            SELECT ticker FROM holdings
            UNION
            SELECT ticker FROM watchlist
            """, nativeQuery = true)
    List<String> findTickersOfInterest();

    /** Retention: drop points older than the cutoff. */
    @Query("DELETE FROM PricePoint p WHERE p.recordedAt < :cutoff")
    @org.springframework.data.jpa.repository.Modifying
    int deleteOlderThan(@Param("cutoff") LocalDateTime cutoff);
}
