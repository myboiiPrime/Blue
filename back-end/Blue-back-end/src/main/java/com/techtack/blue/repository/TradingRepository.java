package com.techtack.blue.repository;

import com.techtack.blue.model.Trading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradingRepository extends JpaRepository<Trading, Long> {
    List<Trading> findByAccountId(String accountId);
    
    List<Trading> findByStatus(String status);
    
    List<Trading> findByOrderType(String orderType);
    
    List<Trading> findByAccountIdAndStatus(String accountId, String status);
    
    List<Trading> findByAccountIdAndOrderType(String accountId, String orderType);
    
    List<Trading> findByOrderId(String orderId);
    
    List<Trading> findBySymbol(String symbol);
    
    List<Trading> findByAccountIdAndSymbol(String accountId, String symbol);
}
