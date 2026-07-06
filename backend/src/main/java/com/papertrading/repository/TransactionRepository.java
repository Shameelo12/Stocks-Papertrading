package com.papertrading.repository;

import com.papertrading.model.Transaction;
import com.papertrading.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByUserOrderByTimestampDesc(User user);
}
