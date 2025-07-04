package com.techtack.blue.repository;

import com.techtack.blue.model.Order;
import com.techtack.blue.model.OrderStatus;
import com.techtack.blue.model.OrderType;
import com.techtack.blue.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUser(User user);
    
    List<Order> findByStockId(Long stockId);
    
    List<Order> findByUserAndStockId(User user, Long stockId);
    
    List<Order> findByUserAndStatus(User user, OrderStatus status);
    
    List<Order> findByUserAndOrderType(User user, OrderType orderType);
    
    List<Order> findByUserAndStatusAndOrderType(User user, OrderStatus status, OrderType orderType);
}
