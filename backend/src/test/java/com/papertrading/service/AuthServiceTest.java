package com.papertrading.service;

import com.papertrading.config.JwtUtil;
import com.papertrading.dto.AuthResponse;
import com.papertrading.dto.LoginRequest;
import com.papertrading.dto.RegisterRequest;
import com.papertrading.model.User;
import com.papertrading.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    private AuthService authService;

    private User testUser;

    private static final BigDecimal STARTING_BALANCE = new BigDecimal("10000.00");

    @BeforeEach
    void setUp() {
        // Constructed explicitly rather than via @InjectMocks: the starting
        // balance is a configuration value, not a collaborator, and @InjectMocks
        // would silently supply null.
        authService = new AuthService(userRepository, passwordEncoder, jwtUtil, STARTING_BALANCE);

        testUser = new User("test@example.com", "hashed_password");
        testUser.setId("test-user-id");
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("newuser@example.com", "password123");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken("test-user-id", "test@example.com")).thenReturn("token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registrationAppliesTheConfiguredStartingBalance() {
        BigDecimal configured = new BigDecimal("25000.00");
        AuthService service = new AuthService(userRepository, passwordEncoder, jwtUtil, configured);

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        service.register(new RegisterRequest("rich@example.com", "password123"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());

        // Both the spendable balance and the frozen performance baseline must
        // reflect the configured value, not the entity's hardcoded default.
        assertEquals(configured, saved.getValue().getBalance());
        assertEquals(configured, saved.getValue().getStartingBalance());
    }

    @Test
    void testRegisterEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("existing@example.com", "password123");

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(jwtUtil.generateToken("test-user-id", "test@example.com")).thenReturn("token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void testLoginUserNotFound() {
        LoginRequest request = new LoginRequest("nonexistent@example.com", "password123");

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> authService.login(request));
    }

    @Test
    void testLoginWrongPassword() {
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "hashed_password")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.login(request));
    }
}
