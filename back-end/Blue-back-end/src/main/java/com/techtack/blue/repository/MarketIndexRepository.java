package com.techtack.blue.repository;

import com.techtack.blue.model.MarketIndex;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketIndexRepository extends JpaRepository<MarketIndex, Long> {
    MarketIndex findByCode(String code);
}