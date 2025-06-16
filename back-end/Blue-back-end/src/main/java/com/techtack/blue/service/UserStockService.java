package com.techtack.blue.service;

import com.techtack.blue.dto.UserStockDto;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.Stock;
import com.techtack.blue.model.User;
import com.techtack.blue.model.UserStock;
import com.techtack.blue.repository.StockRepository;
import com.techtack.blue.repository.UserRepository;
import com.techtack.blue.repository.UserStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserStockService {

    @Autowired
    private UserStockRepository userStockRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StockRepository stockRepository;
    
    @Autowired
    private StockService stockService;

    public List<UserStockDto> getUserStocks(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        List<UserStock> userStocks = userStockRepository.findByUser(user);
        
        return userStocks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public UserStockDto buyStock(Long userId, String symbol, int quantity) throws UserException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Stock stock = stockRepository.findBySymbol(symbol);
        if (stock == null) {
            throw new RuntimeException("Stock not found with symbol: " + symbol);
        }
        
        double totalCost = stock.getPrice() * quantity;
        
        if (user.getAccountBalance() < totalCost) {
            throw new UserException("Insufficient funds to buy stock");
        }
        
        // Update user balance
        user.setAccountBalance(user.getAccountBalance() - totalCost);
        userRepository.save(user);
        
        // Check if user already owns this stock
        UserStock existingUserStock = userStockRepository.findByUserAndStock(user, stock);
        
        if (existingUserStock != null) {
            // Update existing position
            double newTotalCost = (existingUserStock.getPurchasePrice() * existingUserStock.getQuantity()) + totalCost;
            int newTotalQuantity = existingUserStock.getQuantity() + quantity;
            double newAveragePrice = newTotalCost / newTotalQuantity;
            
            existingUserStock.setQuantity(newTotalQuantity);
            existingUserStock.setPurchasePrice(newAveragePrice);
            userStockRepository.save(existingUserStock);
            
            return convertToDto(existingUserStock);
        } else {
            // Create new position
            UserStock userStock = new UserStock();
            userStock.setUser(user);
            userStock.setStock(stock);
            userStock.setQuantity(quantity);
            userStock.setPurchasePrice(stock.getPrice());
            userStock.setPurchaseDate(LocalDateTime.now());
            
            userStockRepository.save(userStock);
            
            return convertToDto(userStock);
        }
    }

    public UserStockDto sellStock(Long userId, String symbol, int quantity) throws UserException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Stock stock = stockRepository.findBySymbol(symbol);
        if (stock == null) {
            throw new RuntimeException("Stock not found with symbol: " + symbol);
        }
        
        UserStock userStock = userStockRepository.findByUserAndStock(user, stock);
        
        if (userStock == null || userStock.getQuantity() < quantity) {
            throw new UserException("Insufficient shares to sell");
        }
        
        double saleProceeds = stock.getPrice() * quantity;
        
        // Update user balance
        user.setAccountBalance(user.getAccountBalance() + saleProceeds);
        userRepository.save(user);
        
        // Update user stock position
        if (userStock.getQuantity() == quantity) {
            // Sell all shares
            userStockRepository.delete(userStock);
            return null;
        } else {
            // Sell partial position
            userStock.setQuantity(userStock.getQuantity() - quantity);
            userStockRepository.save(userStock);
            
            return convertToDto(userStock);
        }
    }

    private UserStockDto convertToDto(UserStock userStock) {
        UserStockDto dto = new UserStockDto();
        dto.setId(userStock.getId());
        dto.setUserId(userStock.getUser().getId());
        dto.setStock(stockService.getStockBySymbol(userStock.getStock().getSymbol()));
        dto.setQuantity(userStock.getQuantity());
        dto.setPurchasePrice(userStock.getPurchasePrice());
        dto.setPurchaseDate(userStock.getPurchaseDate());
        
        // Calculate current value and profit/loss
        double currentPrice = userStock.getStock().getPrice();
        double currentValue = currentPrice * userStock.getQuantity();
        double purchaseValue = userStock.getPurchasePrice() * userStock.getQuantity();
        double profitLoss = currentValue - purchaseValue;
        double profitLossPercent = (profitLoss / purchaseValue) * 100;
        
        dto.setCurrentValue(currentValue);
        dto.setProfitLoss(profitLoss);
        dto.setProfitLossPercent(profitLossPercent);
        
        return dto;
    }
}