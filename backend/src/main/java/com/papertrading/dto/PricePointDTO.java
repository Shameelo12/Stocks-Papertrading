package com.papertrading.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** One point on a price chart. */
public record PricePointDTO(LocalDateTime timestamp, BigDecimal price) {}
