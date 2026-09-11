package com.papertrading.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    /**
     * Timeouts are the point of this bean.
     *
     * <p>A bare {@code builder.build()} has none, so a Finnhub call that stalls
     * holds a Tomcat request thread until the socket eventually gives up. Price
     * lookups sit on the critical path of the portfolio endpoint, which the UI
     * polls every few seconds, so a single upstream stall could exhaust the
     * thread pool and take the whole API down with it.
     *
     * <p>The values are deliberately short. {@code FinnhubService} already treats
     * a failed lookup as an ordinary empty result and falls through to cached or
     * mock prices, so timing out fast and degrading is strictly better than
     * waiting on a request that is unlikely to arrive.
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(3))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
    }
}
