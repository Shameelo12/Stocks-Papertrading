package com.papertrading.repository;

import com.papertrading.model.Holding;
import com.papertrading.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, String> {
    List<Holding> findByUser(User user);
    Optional<Holding> findByUserAndTicker(User user, String ticker);
}
