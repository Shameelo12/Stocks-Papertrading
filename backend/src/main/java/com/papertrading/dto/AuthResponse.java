package com.papertrading.dto;

import java.math.BigDecimal;

public class AuthResponse {
    private String token;
    private String email;
    private BigDecimal balance;

    public AuthResponse() {}

    public AuthResponse(String token, String email, BigDecimal balance) {
        this.token = token;
        this.email = email;
        this.balance = balance;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
