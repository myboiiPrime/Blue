package com.techtack.blue.repository;

import com.techtack.blue.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Stock findBySymbol(String symbol);
    
    @Query("SELECT s FROM Stock s ORDER BY s.volume DESC")
    List<Stock> findTopTradedStocks();
    
    @Query("SELECT s FROM Stock s WHERE (s.price - s.previousClose) / s.previousClose > 0 ORDER BY (s.price - s.previousClose) / s.previousClose DESC")
    List<Stock> findTopGainers();
    
    @Query("SELECT s FROM Stock s WHERE (s.price - s.previousClose) / s.previousClose < 0 ORDER BY (s.price - s.previousClose) / s.previousClose ASC")
    List<Stock> findTopLosers();
}