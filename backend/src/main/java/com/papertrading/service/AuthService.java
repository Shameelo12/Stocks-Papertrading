package com.papertrading.service;

import com.papertrading.config.JwtUtil;
import com.papertrading.dto.AuthResponse;
import com.papertrading.dto.LoginRequest;
import com.papertrading.dto.RegisterRequest;
import com.papertrading.model.User;
import com.papertrading.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BigDecimal startingBalance;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       @Value("${trading.starting-balance:10000.00}") BigDecimal startingBalance) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.startingBalance = startingBalance;
    }

    public AuthResponse register(RegisterRequest request) {
        try {
            logger.info("Register attempt for email: {}", request.getEmail());
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already registered");
            }

            String passwordHash = passwordEncoder.encode(request.getPassword());
            User user = new User(request.getEmail(), passwordHash, startingBalance);
            user = userRepository.save(user);
            logger.info("User registered: {}", user.getId());

            String token = jwtUtil.generateToken(user.getId(), user.getEmail());
            return new AuthResponse(token, user.getEmail(), user.getBalance());
        } catch (Exception e) {
            logger.error("Registration error", e);
            throw e;
        }
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getBalance());
    }
}
