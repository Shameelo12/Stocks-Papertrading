package com.papertrading;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.papertrading.repository")
public class PaperTradingApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaperTradingApplication.class, args);
    }

}
