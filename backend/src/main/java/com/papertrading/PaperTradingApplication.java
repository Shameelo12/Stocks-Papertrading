package com.papertrading;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * {@code UserDetailsServiceAutoConfiguration} is excluded because this application
 * authenticates with JWTs and has no use for a UserDetailsService. Left enabled, it
 * provisions a default in-memory "user" account with a random password printed to
 * the log on every startup — noise at best, and an account nobody intended at worst.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableJpaRepositories(basePackages = "com.papertrading.repository")
@EnableScheduling
public class PaperTradingApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaperTradingApplication.class, args);
    }

}
