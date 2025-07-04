package com.techtack.blue.controller;

import com.techtack.blue.model.Order;
import com.techtack.blue.model.OrderSide;
import com.techtack.blue.model.OrderStatus;
import com.techtack.blue.model.OrderType;
import com.techtack.blue.model.Trading;
import com.techtack.blue.repository.TradingRepository;
import com.techtack.blue.service.TradingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trading")
public class TradingController {

    @Autowired
    private TradingService tradingService;
    
    @Autowired
    private TradingRepository tradingRepository;

    @PostMapping("/orders")
    public ResponseEntity<Order> placeOrder(@RequestBody Order order, @RequestParam("userId") Long userId) {
        // Default to NORMAL order type if not specified
        if (order.getOrderType() == null) {
            order.setOrderType(OrderType.NORMAL);
        }
        
        // Route to specific order placement method based on order type
        Order placedOrder;
        switch (order.getOrderType()) {
            case STOP:
                placedOrder = tradingService.placeStopOrder(order, userId);
                break;
            case STOP_LIMIT:
                placedOrder = tradingService.placeStopLimitOrder(order, userId);
                break;
            case TRAILING_STOP:
                placedOrder = tradingService.placeTrailingStopOrder(order, userId);
                break;
            case TRAILING_STOP_LIMIT:
                placedOrder = tradingService.placeTrailingStopLimitOrder(order, userId);
                break;
            case OCO:
                placedOrder = tradingService.placeOCOOrder(order, userId);
                break;
            case STOP_LOSS_TAKE_PROFIT:
                placedOrder = tradingService.placeStopLossTakeProfitOrder(order, userId);
                break;
            case GTD:
                placedOrder = tradingService.placeGTDOrder(order, userId);
                break;
            default:
                placedOrder = tradingService.placeOrder(order, userId);
        }
        return ResponseEntity.ok(placedOrder);
    }
    
    // Specific endpoints for each order type
    @PostMapping("/orders/normal")
    public ResponseEntity<Order> placeNormalOrder(@RequestBody Order order, @RequestParam("userId") Long userId) {
        order.setOrderType(OrderType.NORMAL);
        return ResponseEntity.ok(tradingService.placeOrder(order, userId));
    }
    
    @PostMapping("/orders/gtd")
    public ResponseEntity<Order> placeGTDOrder(@RequestBody Order order, @RequestParam("userId") Long userId) {
        order.setOrderType(OrderType.GTD);
        return ResponseEntity.ok(tradingService.placeGTDOrder(order, userId));
    }
    
    @PostMapping("/orders/stop")
    public ResponseEntity<Order> placeStopOrder(@RequestBody Order order, @RequestParam("userId") Long userId) {
        order.setOrderType(OrderType.STOP);
        return ResponseEntity.ok(tradingService.placeStopOrder(order, userId));
    }
    
    @PostMapping("/orders/stop-limit")
    public ResponseEntity<Order> placeStopLimitOrder(@RequestBody Order order, @RequestParam("userId") Long userId) {
        order.setOrderType(OrderType.STOP_LIMIT);
        return ResponseEntity.ok(tradingService.placeStopLimitOrder(order, userId));
    }
    
    @PostMapping("/orders/trailing-stop")
    public ResponseEntity<Order> placeTrailingStopOrder(@RequestBody Order order, @RequestParam("userId") Long userId) {
        order.setOrderType(OrderType.TRAILING_STOP);
        return ResponseEntity.ok(tradingService.placeTrailingStopOrder(order, userId));
    }
    
    @PostMapping("/orders/trailing-stop-limit")
    public ResponseEntity<Order> placeTrailingStopLimitOrder(@RequestBody Order order, @RequestParam("userId") Long userId) {
        order.setOrderType(OrderType.TRAILING_STOP_LIMIT);
        return ResponseEntity.ok(tradingService.placeTrailingStopLimitOrder(order, userId));
    }
    
    @PostMapping("/orders/oco")
    public ResponseEntity<Order> placeOCOOrder(@RequestBody Order order, @RequestParam("userId") Long userId) {
        order.setOrderType(OrderType.OCO);
        return ResponseEntity.ok(tradingService.placeOCOOrder(order, userId));
    }
    
    @PostMapping("/orders/stop-loss-take-profit")
    public ResponseEntity<Order> placeStopLossTakeProfitOrder(@RequestBody Order order, @RequestParam("userId") Long userId) {
        order.setOrderType(OrderType.STOP_LOSS_TAKE_PROFIT);
        return ResponseEntity.ok(tradingService.placeStopLossTakeProfitOrder(order, userId));
    }
    
    // Get orders by type
    @GetMapping("/orders/type/{type}")
    public ResponseEntity<List<Order>> getOrdersByType(
            @RequestParam("userId") Long userId,
            @PathVariable String type) {
        try {
            OrderType orderType = OrderType.valueOf(type.toUpperCase());
            List<Order> filteredOrders = tradingService.getOrdersByType(userId, orderType);
            return ResponseEntity.ok(filteredOrders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get orders by status and type
    @GetMapping("/orders/status/{status}/type/{type}")
    public ResponseEntity<List<Order>> getOrdersByStatusAndType(
            @RequestParam("userId") Long userId,
            @PathVariable String status,
            @PathVariable String type) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            OrderType orderType = OrderType.valueOf(type.toUpperCase());
            List<Order> filteredOrders = tradingService.getOrdersByStatusAndType(userId, orderStatus, orderType);
            return ResponseEntity.ok(filteredOrders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all user's orders
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getUserOrders(
            @RequestParam("userId") Long userId) {
        return ResponseEntity.ok(tradingService.getUserOrders(userId));
    }

    // Get open orders (pending status)
    @GetMapping("/orders/open")
    public ResponseEntity<List<Order>> getOpenOrders(
            @RequestParam("userId") Long userId) {
        return ResponseEntity.ok(tradingService.getOrdersByStatus(userId, OrderStatus.PENDING));
    }

    // Cancel an order
    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @RequestParam("userId") Long userId,
            @PathVariable Long orderId) {
        tradingService.cancelOrder(orderId, userId);
        return ResponseEntity.noContent().build();
    }

    // Get order by ID
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @RequestParam("userId") Long userId,
            @PathVariable Long orderId) {
        return tradingService.getUserOrders(userId).stream()
                .filter(order -> order.getId().equals(orderId))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Get orders by status
    @GetMapping("/orders/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(
            @RequestParam("userId") Long userId,
            @PathVariable String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<Order> filteredOrders = tradingService.getOrdersByStatus(userId, orderStatus);
            return ResponseEntity.ok(filteredOrders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get available order types
    @GetMapping("/order-types")
    public ResponseEntity<List<Map<String, String>>> getOrderTypes() {
        return ResponseEntity.ok(
            Arrays.stream(OrderType.values())
                .map(type -> Map.of(
                    "code", type.name(),
                    "name", type.getDisplayName()
                ))
                .toList()
        );
    }
    
    // Get available order sides (buy/sell)
    @GetMapping("/order-sides")
    public ResponseEntity<List<OrderSide>> getOrderSides() {
        return ResponseEntity.ok(Arrays.asList(OrderSide.values()));
    }
    
    // Get available order statuses
    @GetMapping("/order-statuses")
    public ResponseEntity<List<OrderStatus>> getOrderStatuses() {
        return ResponseEntity.ok(Arrays.asList(OrderStatus.values()));
    }
    
    // Get trading records
    @GetMapping("/tradings")
    public ResponseEntity<List<Trading>> getTradingRecords(
            @RequestParam("accountId") String accountId) {
        return ResponseEntity.ok(tradingRepository.findByAccountId(accountId));
    }
    
    // Get trading records by symbol
    @GetMapping("/tradings/symbol/{symbol}")
    public ResponseEntity<List<Trading>> getTradingRecordsBySymbol(
            @RequestParam("accountId") String accountId,
            @PathVariable String symbol) {
        return ResponseEntity.ok(tradingRepository.findByAccountIdAndSymbol(accountId, symbol));
    }
    
    // Get trading records by order type
    @GetMapping("/tradings/type/{orderType}")
    public ResponseEntity<List<Trading>> getTradingRecordsByOrderType(
            @RequestParam("accountId") String accountId,
            @PathVariable String orderType) {
        return ResponseEntity.ok(tradingRepository.findByAccountIdAndOrderType(accountId, orderType));
    }
    
    // Get trading records by status
    @GetMapping("/tradings/status/{status}")
    public ResponseEntity<List<Trading>> getTradingRecordsByStatus(
            @RequestParam("accountId") String accountId,
            @PathVariable String status) {
        return ResponseEntity.ok(tradingRepository.findByAccountIdAndStatus(accountId, status));
    }
}
