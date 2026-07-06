package com.papertrading.repository;

import com.papertrading.model.PendingOrder;
import com.papertrading.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PendingOrderRepository extends JpaRepository<PendingOrder, String> {
    List<PendingOrder> findByUserAndStatus(User user, PendingOrder.OrderStatus status);
    List<PendingOrder> findByUser(User user);
    void deleteByIdAndUser(String id, User user);
}
