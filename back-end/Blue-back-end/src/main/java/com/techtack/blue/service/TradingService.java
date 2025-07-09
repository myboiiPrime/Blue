package com.techtack.blue.service;

import com.techtack.blue.exception.InsufficientFundsException;
import com.techtack.blue.model.*;
import com.techtack.blue.repository.OrderRepository;
import com.techtack.blue.repository.StockRepository;
import com.techtack.blue.repository.TradingRepository;
import com.techtack.blue.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class TradingService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private StockRepository stockRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TradingRepository tradingRepository;

    @Transactional
    public Order placeOrder(Order order, Long userId) {
        // Validate user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Validate stock exists - find by symbol from the order
        Stock stock = stockRepository.findBySymbol(order.getSymbol());
        if (stock == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Stock not found with symbol: " + order.getSymbol());
        }
        
        // Set relationships
        order.setUser(user);
        order.setStock(stock);
        order.setSymbol(stock.getSymbol());
        order.setEntryDate(LocalDate.now());
        order.setEntryTime(LocalTime.now());
        
        // Validate order type specific fields
        validateOrderTypeFields(order);
        
        // For buy orders, we'll need to check user's buying power
        if (order.getOrderSide() == OrderSide.BUY) {
            double totalCost = order.getPrice() * order.getQuantity();
            // Assuming user has a buyingPower field now
            if (user.getBuyingPower() < totalCost) {
                throw new InsufficientFundsException("Insufficient buying power");
            }
            // Deduct from user's buying power
            user.setBuyingPower(user.getBuyingPower() - totalCost);
            userRepository.save(user);
        }
        
        // Set buying power and max quantity for reference
        order.setBuyingPower(user.getBuyingPower());
        order.setMaxQuantity(calculateMaxQuantity(user.getBuyingPower(), order.getPrice()));
        
        // Save the order
        Order savedOrder = orderRepository.save(order);
        
        // Create a Trading record for the order
        createTradingFromOrder(savedOrder);
        
        return savedOrder;
    }
    
    private void validateOrderTypeFields(Order order) {
        switch (order.getOrderType()) {
            case STOP_LIMIT:
                if (order.getTriggerPrice() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trigger price is required for Stop Limit orders");
                }
                break;
            case TRAILING_STOP:
            case TRAILING_STOP_LIMIT:
                if (order.getTrailingAmount() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trailing amount is required for Trailing Stop/Limit orders");
                }
                break;
            case OCO:
                if (order.getTakeProfitPrice() == null || order.getCutLossPrice() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Take profit and cut loss prices are required for OCO orders");
                }
                break;
            case STOP_LOSS_TAKE_PROFIT:
                if (order.getTakeProfitPrice() == null || order.getCutLossPrice() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Take profit and cut loss prices are required for Stop Loss/Take Profit orders");
                }
                break;
            case GTD:
                if (order.getExpiryDate() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiry date is required for GTD orders");
                }
                break;
        }
    }
    
    private Double calculateMaxQuantity(Double buyingPower, Double price) {
        if (price == null || price <= 0) {
            return 0.0;
        }
        return Math.floor(buyingPower / price);
    }
    
    private void createTradingFromOrder(Order order) {
        Trading trading = new Trading();
        trading.setSymbol(order.getStock().getSymbol());
        trading.setAccountId(order.getUser().getId().toString());
        trading.setOrderId(order.getId().toString());
        trading.setQuantity(order.getQuantity().doubleValue());
        trading.setPrice(order.getPrice());
        trading.setTriggerPrice(order.getTriggerPrice());
        trading.setTrailingAmount(order.getTrailingAmount());
        trading.setTakeProfitPrice(order.getTakeProfitPrice());
        trading.setCutLossPrice(order.getCutLossPrice());
        trading.setToler(order.getToler());
        trading.setOrderType(order.getOrderType().name());
        trading.setStatus(order.getStatus().name());
        trading.setMarketPrice(order.getMarketPrice());
        trading.setEffectiveDate(order.getEffectiveDate());
        trading.setExpiryDate(order.getExpiryDate());
        trading.setCreatedAt(order.getEntryTime());
        trading.setBuying_power(order.getBuyingPower());
        trading.setMax_quantity(order.getMaxQuantity());
        
        tradingRepository.save(trading);
    }
    
    // Get all orders for a user
    public List<Order> getUserOrders(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return orderRepository.findByUser(user);
    }
    
    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        
        // Verify the order belongs to the user
        if (!order.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access to order denied");
        }
        
        // Only allow cancellation of pending orders
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel a " + order.getStatus() + " order");
        }
        
        // Refund buying power for buy orders
        if (order.getOrderSide() == OrderSide.BUY) {
            User user = order.getUser();
            user.setBuyingPower(user.getBuyingPower() + (order.getPrice() * order.getQuantity()));
            userRepository.save(user);
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        // Update the Trading record status
        List<Trading> tradingRecords = tradingRepository.findByOrderId(orderId.toString());
        if (!tradingRecords.isEmpty()) {
            Trading trading = tradingRecords.get(0);
            trading.setStatus(OrderStatus.CANCELLED.name());
            tradingRepository.save(trading);
        }
    }
    
    public List<Order> getOpenOrders(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return orderRepository.findByUserAndStatus(user, OrderStatus.PENDING);
    }
    
    public List<Order> getOrdersByStatus(Long userId, OrderStatus status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return orderRepository.findByUserAndStatus(user, status);
    }
    
    // Get orders by type
    public List<Order> getOrdersByType(Long userId, OrderType orderType) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return orderRepository.findByUserAndOrderType(user, orderType);
    }
    
    // Get orders by status and type
    public List<Order> getOrdersByStatusAndType(Long userId, OrderStatus status, OrderType orderType) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return orderRepository.findByUserAndStatusAndOrderType(user, status, orderType);
    }
    
    // Place a Stop order
    @Transactional
    public Order placeStopOrder(Order order, Long userId) {
        order.setOrderType(OrderType.STOP);
        
        // Validate trigger price is set
        if (order.getTriggerPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trigger price is required for Stop orders");
        }
        
        return placeOrder(order, userId);
    }
    
    // Place a Stop Limit order
    @Transactional
    public Order placeStopLimitOrder(Order order, Long userId) {
        order.setOrderType(OrderType.STOP_LIMIT);
        
        // Validate trigger price and limit price are set
        if (order.getTriggerPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trigger price is required for Stop Limit orders");
        }
        if (order.getPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limit price is required for Stop Limit orders");
        }
        
        return placeOrder(order, userId);
    }
    
    // Place a Trailing Stop order
    @Transactional
    public Order placeTrailingStopOrder(Order order, Long userId) {
        order.setOrderType(OrderType.TRAILING_STOP);
        
        // Validate trailing amount is set
        if (order.getTrailingAmount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trailing amount is required for Trailing Stop orders");
        }
        
        return placeOrder(order, userId);
    }
    
    // Place a Trailing Stop Limit order
    @Transactional
    public Order placeTrailingStopLimitOrder(Order order, Long userId) {
        order.setOrderType(OrderType.TRAILING_STOP_LIMIT);
        
        // Validate trailing amount and limit price are set
        if (order.getTrailingAmount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trailing amount is required for Trailing Stop Limit orders");
        }
        if (order.getPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limit price is required for Trailing Stop Limit orders");
        }
        
        return placeOrder(order, userId);
    }
    
    // Place an OCO (One-Cancels-Other) order
    @Transactional
    public Order placeOCOOrder(Order order, Long userId) {
        order.setOrderType(OrderType.OCO);
        
        // Validate take profit and cut loss prices are set
        if (order.getTakeProfitPrice() == null || order.getCutLossPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Take profit and cut loss prices are required for OCO orders");
        }
        
        return placeOrder(order, userId);
    }
    
    // Place a Stop Loss/Take Profit order
    @Transactional
    public Order placeStopLossTakeProfitOrder(Order order, Long userId) {
        order.setOrderType(OrderType.STOP_LOSS_TAKE_PROFIT);
        
        // Validate take profit and cut loss prices are set
        if (order.getTakeProfitPrice() == null || order.getCutLossPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Take profit and cut loss prices are required for Stop Loss/Take Profit orders");
        }
        
        return placeOrder(order, userId);
    }
    
    // Place a GTD (Good Till Date) order
    @Transactional
    public Order placeGTDOrder(Order order, Long userId) {
        order.setOrderType(OrderType.GTD);
        
        // Validate expiry date is set
        if (order.getExpiryDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiry date is required for GTD orders");
        }
        
        return placeOrder(order, userId);
    }

    @Transactional
    public Order placeNormalOrder(Order order, Long userId) {
        order.setOrderType(OrderType.NORMAL);
        
        // Normal orders don't require additional validation beyond basic order fields
        return placeOrder(order, userId);
    }
}
