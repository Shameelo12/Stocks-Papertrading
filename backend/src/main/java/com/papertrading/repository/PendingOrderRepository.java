package com.papertrading.repository;

import com.papertrading.model.PendingOrder;
import com.papertrading.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PendingOrderRepository extends JpaRepository<PendingOrder, String> {
    List<PendingOrder> findByUserAndStatus(User user, PendingOrder.OrderStatus status);
    List<PendingOrder> findByUser(User user);
    void deleteByIdAndUser(String id, User user);

    List<PendingOrder> findByStatus(PendingOrder.OrderStatus status);

    /**
     * Every unfilled order, across all users, with its owner already loaded —
     * the scheduler's work queue.
     *
     * <p>The fetch join is required, not an optimisation. {@code PendingOrder.user}
     * is LAZY, and the scheduled sweep runs outside any request, so with
     * open-in-view disabled there is no session to initialise the proxy when
     * execution reaches {@code order.getUser()}. Without this, every sweep failed
     * with "could not initialize proxy [User] - no Session" and no order ever
     * filled on a timer.
     */
    @Query("SELECT o FROM PendingOrder o JOIN FETCH o.user WHERE o.status = :status")
    List<PendingOrder> findByStatusWithUser(@Param("status") PendingOrder.OrderStatus status);
}
