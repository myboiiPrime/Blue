package com.techtack.blue.service;

import com.techtack.blue.dto.*;
import com.techtack.blue.model.*;
import com.techtack.blue.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketService {

    @Autowired
    private MarketIndexRepository marketIndexRepository;
    
    @Autowired
    private MarketNetFlowRepository marketNetFlowRepository;
    
    @Autowired
    private IndustryHeatmapRepository industryHeatmapRepository;
    
    @Autowired
    private MajorImpactStockRepository majorImpactStockRepository;
    
    @Autowired
    private MarketMoverRepository marketMoverRepository;
    
    @Autowired
    private ForeignTradingRepository foreignTradingRepository;
    
    @Autowired
    private MarketLiquidityRepository marketLiquidityRepository;
    
    
    public List<MarketIndexDto> getAllMarketIndices() {
        List<MarketIndex> indices = marketIndexRepository.findAll();
        return indices.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public MarketIndexDto getMarketIndexByCode(String code) {
        MarketIndex index = marketIndexRepository.findByCode(code);
        if (index == null) {
            return null;
        }
        return convertToDto(index);
    }
    
    private MarketIndexDto convertToDto(MarketIndex index) {
        MarketIndexDto dto = new MarketIndexDto();
        dto.setId(index.getId());
        dto.setCode(index.getCode());
        dto.setValue(index.getValue());
        dto.setChange(index.getChange());
        dto.setChangePercent(index.getChangePercent());
        dto.setVolume(index.getVolume());
        dto.setLastUpdated(index.getLastUpdated());
        return dto;
    }
    
    // Market Net Flow methods
    public List<MarketNetFlowDto> getMarketNetFlow(String marketCode) {
        MarketIndex marketIndex = marketIndexRepository.findByCode(marketCode);
        if (marketIndex == null) {
            return List.of();
        }
        
        List<MarketNetFlow> netFlows = marketNetFlowRepository.findByMarketIndex(marketIndex);
        return netFlows.stream().map(this::convertToNetFlowDto).collect(Collectors.toList());
    }
    
    private MarketNetFlowDto convertToNetFlowDto(MarketNetFlow netFlow) {
        MarketNetFlowDto dto = new MarketNetFlowDto();
        dto.setId(netFlow.getId());
        dto.setNetFlow(netFlow.getNetFlow());
        dto.setCashIn(netFlow.getCashIn());
        dto.setCashOut(netFlow.getCashOut());
        dto.setDate(netFlow.getDate());
        dto.setMarketIndexId(netFlow.getMarketIndex().getId());
        return dto;
    }
    
    // Industry Heatmap methods
    public List<IndustryHeatmapDto> getIndustryHeatmap(String marketCode) {
        MarketIndex marketIndex = marketIndexRepository.findByCode(marketCode);
        if (marketIndex == null) {
            return List.of();
        }
        
        List<IndustryHeatmap> heatmaps = industryHeatmapRepository.findByMarketIndex(marketIndex);
        return heatmaps.stream().map(this::convertToHeatmapDto).collect(Collectors.toList());
    }
    
    private IndustryHeatmapDto convertToHeatmapDto(IndustryHeatmap heatmap) {
        IndustryHeatmapDto dto = new IndustryHeatmapDto();
        dto.setId(heatmap.getId());
        dto.setIndustryName(heatmap.getIndustryName());
        dto.setChangePercent(heatmap.getChangePercent());
        dto.setMarketCap(heatmap.getMarketCap());
        dto.setNumberOfStocks(heatmap.getNumberOfStocks());
        dto.setLastUpdated(heatmap.getLastUpdated());
        dto.setMarketIndexId(heatmap.getMarketIndex().getId());
        return dto;
    }
    
    // Major Impact Stocks methods
    public List<MajorImpactStockDto> getMajorImpactStocks(String marketCode) {
        MarketIndex marketIndex = marketIndexRepository.findByCode(marketCode);
        if (marketIndex == null) {
            return List.of();
        }
        
        List<MajorImpactStock> impactStocks = majorImpactStockRepository.findByMarketIndexOrderByImpactPercentageDesc(marketIndex);
        return impactStocks.stream().map(this::convertToImpactStockDto).collect(Collectors.toList());
    }
    
    private MajorImpactStockDto convertToImpactStockDto(MajorImpactStock impactStock) {
        MajorImpactStockDto dto = new MajorImpactStockDto();
        dto.setId(impactStock.getId());
        
        // Convert Stock to StockDto
        StockDto stockDto = new StockDto();
        Stock stock = impactStock.getStock();
        stockDto.setId(stock.getId());
        stockDto.setSymbol(stock.getSymbol());
        stockDto.setName(stock.getName());
        stockDto.setPrice(stock.getPrice());
        stockDto.setChangeAmount(stock.getChange());
        stockDto.setChangePercent(stock.getChangePercent());
        
        dto.setStock(stockDto);
        dto.setMarketIndexId(impactStock.getMarketIndex().getId());
        dto.setImpactValue(impactStock.getImpactValue());
        dto.setImpactPercentage(impactStock.getImpactPercentage());
        dto.setLastUpdated(impactStock.getLastUpdated());
        return dto;
    }
    
    // Market Movers methods
    public List<MarketMoverDto> getMarketMovers(String marketCode, MarketMover.MoverType type) {
        MarketIndex marketIndex = marketIndexRepository.findByCode(marketCode);
        if (marketIndex == null) {
            return List.of();
        }
        
        List<MarketMover> movers = marketMoverRepository.findByMarketIndexAndTypeOrderByRankAsc(marketIndex, type);
        return movers.stream().map(this::convertToMoverDto).collect(Collectors.toList());
    }
    
    private MarketMoverDto convertToMoverDto(MarketMover mover) {
        MarketMoverDto dto = new MarketMoverDto();
        dto.setId(mover.getId());
        
        // Convert Stock to StockDto
        StockDto stockDto = new StockDto();
        Stock stock = mover.getStock();
        stockDto.setId(stock.getId());
        stockDto.setSymbol(stock.getSymbol());
        stockDto.setName(stock.getName());
        stockDto.setPrice(stock.getPrice());
        stockDto.setChangeAmount(stock.getChange());
        stockDto.setChangePercent(stock.getChangePercent());
        
        dto.setStock(stockDto);
        dto.setMarketIndexId(mover.getMarketIndex().getId());
        dto.setType(mover.getType());
        dto.setRank(mover.getRank());
        dto.setLastUpdated(mover.getLastUpdated());
        return dto;
    }
    
    // Foreign Trading methods
    public List<ForeignTradingDto> getTopForeignTrading(String marketCode) {
        MarketIndex marketIndex = marketIndexRepository.findByCode(marketCode);
        if (marketIndex == null) {
            return List.of();
        }
        
        List<ForeignTrading> foreignTradings = foreignTradingRepository.findByMarketIndexOrderByRankAsc(marketIndex);
        return foreignTradings.stream().map(this::convertToForeignTradingDto).collect(Collectors.toList());
    }
    
    private ForeignTradingDto convertToForeignTradingDto(ForeignTrading foreignTrading) {
        ForeignTradingDto dto = new ForeignTradingDto();
        dto.setId(foreignTrading.getId());
        
        // Convert Stock to StockDto
        StockDto stockDto = new StockDto();
        Stock stock = foreignTrading.getStock();
        stockDto.setId(stock.getId());
        stockDto.setSymbol(stock.getSymbol());
        stockDto.setName(stock.getName());
        stockDto.setPrice(stock.getPrice());
        stockDto.setChangeAmount(stock.getChange());
        stockDto.setChangePercent(stock.getChangePercent());
        
        dto.setStock(stockDto);
        dto.setMarketIndexId(foreignTrading.getMarketIndex().getId());
        dto.setBuyValue(foreignTrading.getBuyValue());
        dto.setSellValue(foreignTrading.getSellValue());
        dto.setNetValue(foreignTrading.getNetValue());
        dto.setRank(foreignTrading.getRank());
        dto.setLastUpdated(foreignTrading.getLastUpdated());
        return dto;
    }
    
    // Market Liquidity methods
    public List<MarketLiquidityDto> getMarketLiquidity(String marketCode) {
        MarketIndex marketIndex = marketIndexRepository.findByCode(marketCode);
        if (marketIndex == null) {
            return List.of();
        }
        
        List<MarketLiquidity> liquidities = marketLiquidityRepository.findByMarketIndex(marketIndex);
        return liquidities.stream().map(this::convertToLiquidityDto).collect(Collectors.toList());
    }
    
    private MarketLiquidityDto convertToLiquidityDto(MarketLiquidity liquidity) {
        MarketLiquidityDto dto = new MarketLiquidityDto();
        dto.setId(liquidity.getId());
        dto.setMarketIndexId(liquidity.getMarketIndex().getId());
        dto.setLiquidityValue(liquidity.getLiquidityValue());
        dto.setNormalizedValue(liquidity.getNormalizedValue());
        dto.setDate(liquidity.getDate());
        return dto;
    }
}