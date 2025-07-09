package com.techtack.blue.controller;

import com.techtack.blue.dto.StockDto;
import com.techtack.blue.dto.MarketIndexDto;
import com.techtack.blue.service.StockService;
import com.techtack.blue.service.MarketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private StockService stockService;
    
    @Autowired
    private MarketService marketService;
    
    @GetMapping("/market-data")
    public ResponseEntity<Map<String, Object>> getMarketData() {
        Map<String, Object> response = new HashMap<>();
        
        // Get market indices
        List<MarketIndexDto> indices = marketService.getAllMarketIndices();
        response.put("indices", indices);
        
        // Get active stocks
        List<StockDto> activeStocks = stockService.getTopTradedStocks();
        response.put("activeStocks", activeStocks);
        
        // Get top gainers
        List<StockDto> topGainers = stockService.getTopGainers();
        response.put("topGainers", topGainers);
        
        // Get top losers
        List<StockDto> topLosers = stockService.getTopLosers();
        response.put("topLosers", topLosers);
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}