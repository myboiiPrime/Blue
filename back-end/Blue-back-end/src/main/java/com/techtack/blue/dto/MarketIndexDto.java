package com.techtack.blue.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MarketIndexDto {
    private Long id;
    private String code;
    private double value;
    private double change;
    private double changePercent;
    private long volume;
    private LocalDateTime lastUpdated;
}