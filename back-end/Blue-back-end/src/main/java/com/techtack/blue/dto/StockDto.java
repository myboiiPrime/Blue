package com.techtack.blue.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StockDto {
    private Long id;
    private String symbol;
    private String name;
    private double price;
    private double open;
    private double high;
    private double low;
    private double previousClose;
    private long volume;
    private LocalDateTime lastUpdated;
    private double changeAmount;
    private double changePercent;
}