package com.techtack.blue.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AlphaVantageConfig {
    
    @Value("${alphavantage.api.key}")
    private String apiKey;
    
    @Value("${alphavantage.api.url}")
    private String baseUrl;

    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}