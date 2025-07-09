package com.techtack.blue.response;

import com.techtack.blue.dto.MarketIndexDto;
import com.techtack.blue.dto.StockDto;
import lombok.Data;

import java.util.List;

@Data
public class DashboardResponse {
    private boolean status;
    private String message;
    private List<MarketIndexDto> indices;
    private List<StockDto> activeStocks;
    private List<StockDto> topGainers;
    private List<StockDto> topLosers;
}