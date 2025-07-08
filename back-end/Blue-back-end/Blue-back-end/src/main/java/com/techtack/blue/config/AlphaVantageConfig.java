package com.techtack.blue.config;

public class AlphaVantageConfig {
    private String apiKey;
    private String baseUrl;

    public AlphaVantageConfig() {
        this.apiKey = "API_KEY";
        this.baseUrl = "https://www.alphavantage.co/query";
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}