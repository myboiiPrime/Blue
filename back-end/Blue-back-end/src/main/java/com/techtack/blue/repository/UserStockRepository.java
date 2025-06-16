package com.techtack.blue.repository;

import com.techtack.blue.model.Stock;
import com.techtack.blue.model.User;
import com.techtack.blue.model.UserStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserStockRepository extends JpaRepository<UserStock, Long> {
    List<UserStock> findByUser(User user);
    UserStock findByUserAndStock(User user, Stock stock);
}