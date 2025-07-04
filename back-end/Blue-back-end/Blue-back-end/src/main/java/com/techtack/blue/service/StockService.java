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
    
    // Market index methods (previously in MarketService)
    public List<StockDto> getAllMarketIndices() {
        List<Stock> indices = stockRepository.findAllMarketIndices();
        return indices.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public StockDto getMarketIndexByCode(String code) {
        Stock index = stockRepository.findByCodeAndIsMarketIndexTrue(code);
        if (index == null) {
            return null;
        }
        return convertToDto(index);
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
        
        // Set market index specific fields
        dto.setMarketIndex(stock.isMarketIndex());
        dto.setCode(stock.getCode());
        
        // For regular stocks, calculate change amount and percentage
        if (!stock.isMarketIndex()) {
            double changeAmount = stock.getPrice() - stock.getPreviousClose();
            double changePercent = (changeAmount / stock.getPreviousClose()) * 100;
            
            dto.setChangeAmount(changeAmount);
            dto.setChangePercent(changePercent);
        } else {
            // For market indices, use the stored change values
            dto.setChange(stock.getChange());
            dto.setChangeAmount(stock.getChange());
            dto.setChangePercent(stock.getChangePercent());
        }
        
        return dto;
    }
}