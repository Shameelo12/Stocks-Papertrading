package com.papertrading;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.papertrading.repository")
@EnableScheduling
public class PaperTradingApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaperTradingApplication.class, args);
    }

}
