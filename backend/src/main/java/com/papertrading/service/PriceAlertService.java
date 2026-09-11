package com.papertrading.service;

import com.papertrading.dto.CreatePriceAlertRequest;
import com.papertrading.dto.PriceAlertDTO;
import com.papertrading.model.PriceAlert;
import com.papertrading.model.User;
import com.papertrading.repository.PriceAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PriceAlertService {

    private final PriceAlertRepository alertRepository;

    public PriceAlertService(PriceAlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public PriceAlertDTO createAlert(User user, CreatePriceAlertRequest request) {
        PriceAlert.AlertType type = PriceAlert.AlertType.valueOf(request.getType().toUpperCase());
        // Normalised on the way in so the evaluator can group alerts by ticker
        // without "aapl" and "AAPL" splitting into separate price lookups.
        PriceAlert alert = new PriceAlert(user, request.getTicker().toUpperCase(), request.getTargetPrice(), type);
        alertRepository.save(alert);
        return toPriceAlertDTO(alert);
    }

    public List<PriceAlertDTO> getActiveAlerts(User user) {
        return alertRepository.findByUserAndActive(user, true)
                .stream()
                .map(this::toPriceAlertDTO)
                .collect(Collectors.toList());
    }

    public List<PriceAlertDTO> getAllAlerts(User user) {
        return alertRepository.findByUser(user)
                .stream()
                .map(this::toPriceAlertDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAlert(User user, String alertId) {
        alertRepository.deleteByIdAndUser(alertId, user);
    }

    private PriceAlertDTO toPriceAlertDTO(PriceAlert alert) {
        return new PriceAlertDTO(
                alert.getId(),
                alert.getTicker(),
                alert.getTargetPrice(),
                alert.getType().name(),
                alert.isActive(),
                alert.getCreatedAt(),
                alert.getTriggeredAt()
        );
    }
}
