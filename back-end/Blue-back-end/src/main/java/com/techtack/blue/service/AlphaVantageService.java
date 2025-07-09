package com.techtack.blue.service;

import com.techtack.blue.config.AlphaVantageConfig;
import com.techtack.blue.model.Stock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public List<Stock> searchStocks(String keywords) {
        String url = config.getBaseUrl() + "?function=SYMBOL_SEARCH&keywords=" + keywords + "&apikey=" + config.getApiKey();
        
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        List<Map<String, String>> matches = (List<Map<String, String>>) response.get("bestMatches");
        
        if (matches == null || matches.isEmpty()) {
            return List.of();
        }
        
        return matches.stream().map(match -> {
            Stock stock = new Stock();
            stock.setSymbol(match.get("1. symbol"));
            stock.setName(match.get("2. name"));

            try {
                stock.setPrice(Double.parseDouble(match.getOrDefault("9. matchScore", "0")));
                stock.setLastUpdated(LocalDateTime.now());
            } catch (NumberFormatException e) {
                stock.setPrice(0);
            }
            
            return stock;
        }).collect(Collectors.toList());
    }

    public Stock searchStock(String keywords) {
        List<Stock> stocks = searchStocks(keywords);
        if (stocks.isEmpty()) {
            return null;
        }
        
        Stock bestMatch = stocks.get(0);
        return getStockQuote(bestMatch.getSymbol());
    }
}