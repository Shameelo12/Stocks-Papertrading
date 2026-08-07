package com.papertrading.service;

import com.papertrading.model.User;
import com.papertrading.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser(Authentication auth) {
        if (auth == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = auth.getName();
        if (userId == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
