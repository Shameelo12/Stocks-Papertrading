package com.papertrading.repository;

import com.papertrading.model.PriceAlert;
import com.papertrading.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, String> {
    List<PriceAlert> findByUserAndActive(User user, boolean active);
    List<PriceAlert> findByUser(User user);
    void deleteByIdAndUser(String id, User user);
}
