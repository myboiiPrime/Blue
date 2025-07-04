package com.techtack.blue.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserStockDto {
    private Long id;
    private Long userId;
    private StockDto stock;
    private int quantity;
    private double purchasePrice;
    private LocalDateTime purchaseDate;
    private double currentValue;
    private double profitLoss;
    private double profitLossPercent;
}