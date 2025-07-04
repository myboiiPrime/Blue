package com.techtack.blue.service;

import com.techtack.blue.dto.MarketIndexDto;
import com.techtack.blue.model.MarketIndex;
import com.techtack.blue.repository.MarketIndexRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketService {

    @Autowired
    private MarketIndexRepository marketIndexRepository;
    
    
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
}