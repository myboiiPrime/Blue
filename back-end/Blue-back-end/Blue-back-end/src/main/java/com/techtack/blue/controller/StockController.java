package com.techtack.blue.controller;

import com.techtack.blue.dto.StockDto;
import com.techtack.blue.service.StockService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stocks")
public class StockController {

    @Autowired
    private StockService stockService;

    
    @GetMapping("/search")
    public ResponseEntity<?> searchStocks(@Valid @RequestParam String query) {
        List<StockDto> results = stockService.searchStocks(query);
        if (results.isEmpty()) { 
            return new ResponseEntity<>("No stocks found matching: " + query, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(results, HttpStatus.OK);
    }
    
    @GetMapping("/{symbol}")
    public ResponseEntity<?> getStockBySymbol(@Valid @PathVariable String symbol) {
        StockDto stock = stockService.getStockBySymbol(symbol);
        if (stock == null) {
            return new ResponseEntity<>("Stock not found with symbol: " + symbol, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(stock, HttpStatus.OK);
    }
    
    @GetMapping("/market-overview")
    public ResponseEntity<Map<String, Object>> getMarketOverview() {
        Map<String, Object> response = new HashMap<>();
        
        List<StockDto> topTraded = stockService.getTopTradedStocks();
        List<StockDto> topGainers = stockService.getTopGainers();
        List<StockDto> topLosers = stockService.getTopLosers();
        List<StockDto> indices = stockService.getAllMarketIndices();
        
        response.put("topTraded", topTraded);
        response.put("topGainers", topGainers);
        response.put("topLosers", topLosers);
        response.put("marketIndices", indices);
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @GetMapping("/market-indices")
    public ResponseEntity<List<StockDto>> getAllMarketIndices() {
        List<StockDto> indices = stockService.getAllMarketIndices();
        return new ResponseEntity<>(indices, HttpStatus.OK);
    }
    
    @GetMapping("/market-indices/{code}")
    public ResponseEntity<?> getMarketIndexByCode(@Valid @PathVariable String code) {
        StockDto index = stockService.getMarketIndexByCode(code);
        if (index == null) {
            return new ResponseEntity<>("Market index not found with code: " + code, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(index, HttpStatus.OK);
    }
}