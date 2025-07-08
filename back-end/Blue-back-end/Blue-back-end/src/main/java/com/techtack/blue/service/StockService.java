package com.techtack.blue.service;

import com.techtack.blue.dto.StockDto;
import com.techtack.blue.model.Stock;
import com.techtack.blue.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;
    
    @Autowired
    private AlphaVantageService alphaVantageService;

    public StockDto getStockBySymbol(String symbol) {
        Stock stock = stockRepository.findBySymbol(symbol);
        
        if (stock == null) {
            stock = alphaVantageService.getStockQuote(symbol);
            if (stock != null) {
                stockRepository.save(stock);
            } else {
                return null;
            }
        }
        
        return convertToDto(stock);
    }

    public List<StockDto> getTopTradedStocks() {
        List<Stock> stocks = stockRepository.findTopTradedStocks();
        return stocks.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<StockDto> getTopGainers() {
        List<Stock> stocks = stockRepository.findTopGainers();
        return stocks.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<StockDto> getTopLosers() {
        List<Stock> stocks = stockRepository.findTopLosers();
        return stocks.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<StockDto> searchStocks(String query) {
        List<Stock> stocks = alphaVantageService.searchStocks(query);
        return stocks.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<StockDto> getStocksByIndustry(String industry) {
        List<Stock> stocks = stockRepository.findByIndustry(industry);
        return stocks.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<StockDto> getStocksByMarketCapRange(double minMarketCap, double maxMarketCap) {
        List<Stock> stocks = stockRepository.findByMarketCapRange(minMarketCap, maxMarketCap);
        return stocks.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<StockDto> getAllStocks() {
        List<Stock> stocks = stockRepository.findAll();
        return stocks.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private StockDto convertToDto(Stock stock) {
        StockDto dto = new StockDto();
        dto.setId(stock.getId());
        dto.setSymbol(stock.getSymbol());
        dto.setName(stock.getName());
        dto.setPrice(stock.getPrice());
        dto.setOpen(stock.getOpen());
        dto.setHigh(stock.getHigh());
        dto.setLow(stock.getLow());
        dto.setPreviousClose(stock.getPreviousClose());
        dto.setVolume(stock.getVolume());
        dto.setLastUpdated(stock.getLastUpdated());
        dto.setIndustry(stock.getIndustry());
        dto.setMarketCap(stock.getMarketCap());
        
        // Calculate change amount and percentage
        double changeAmount = stock.getPrice() - stock.getPreviousClose();
        double changePercent = (changeAmount / stock.getPreviousClose()) * 100;
        
        dto.setChangeAmount(changeAmount);
        dto.setChangePercent(changePercent);
        
        return dto;
    }
}