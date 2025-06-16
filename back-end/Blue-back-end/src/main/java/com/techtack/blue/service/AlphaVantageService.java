package com.techtack.blue.service;

import com.techtack.blue.config.AlphaVantageConfig;
import com.techtack.blue.model.Stock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AlphaVantageService {

    private final RestTemplate restTemplate;
    private final AlphaVantageConfig config;

    @Autowired
    public AlphaVantageService(RestTemplate restTemplate, AlphaVantageConfig config) {
        this.restTemplate = restTemplate;
        this.config = config;
    }

    public Stock getStockQuote(String symbol) {
        String url = config.getBaseUrl() + "?function=GLOBAL_QUOTE&symbol=" + symbol + "&apikey=" + config.getApiKey();
        
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        Map<String, String> globalQuote = (Map<String, String>) response.get("Global Quote");
        
        if (globalQuote == null || globalQuote.isEmpty()) {
            return null;
        }
        
        Stock stock = new Stock();
        stock.setSymbol(symbol);
        stock.setPrice(Double.parseDouble(globalQuote.get("05. price")));
        stock.setOpen(Double.parseDouble(globalQuote.get("02. open")));
        stock.setHigh(Double.parseDouble(globalQuote.get("03. high")));
        stock.setLow(Double.parseDouble(globalQuote.get("04. low")));
        stock.setPreviousClose(Double.parseDouble(globalQuote.get("08. previous close")));
        stock.setVolume(Long.parseLong(globalQuote.get("06. volume")));
        stock.setLastUpdated(LocalDateTime.now());
        
        return stock;
    }

    public Stock searchStock(String keywords) {
        String url = config.getBaseUrl() + "?function=SYMBOL_SEARCH&keywords=" + keywords + "&apikey=" + config.getApiKey();
        
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        List<Map<String, String>> matches = (List<Map<String, String>>) response.get("bestMatches");
        
        if (matches == null || matches.isEmpty()) {
            return null;
        }
        
        Map<String, String> bestMatch = matches.get(0);
        
        Stock stock = new Stock();
        stock.setSymbol(bestMatch.get("1. symbol"));
        stock.setName(bestMatch.get("2. name"));
        
        // Get the current price and other details
        return getStockQuote(stock.getSymbol());
    }
}