package com.techtack.blue.controller;

import com.techtack.blue.dto.StockDto;
import com.techtack.blue.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class HomeController {

    @Autowired
    private StockService stockService;

    @GetMapping("/")
    public String home() {
        return "Welcome to Blue Stock Trading Application";
    }
    
    @GetMapping("/api/market-overview")
    public ResponseEntity<Map<String, Object>> getMarketOverview() {
        Map<String, Object> response = new HashMap<>();
        
        List<StockDto> topTraded = stockService.getTopTradedStocks();
        List<StockDto> topGainers = stockService.getTopGainers();
        List<StockDto> topLosers = stockService.getTopLosers();
        
        response.put("topTraded", topTraded);
        response.put("topGainers", topGainers);
        response.put("topLosers", topLosers);
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}