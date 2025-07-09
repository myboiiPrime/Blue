package com.techtack.blue.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "orders")
@Data
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;
    
    private String symbol;
    
    @Min(0)
    @Column(nullable = false)
    private Integer quantity;
    
    @DecimalMin("0.0")
    private Double price;
    
    @DecimalMin("0.0")
    private Double triggerPrice;
    
    @DecimalMin("0.0")
    private Double trailingAmount;
    
    @DecimalMin("0.0")
    private Double takeProfitPrice;
    
    @DecimalMin("0.0")
    private Double cutLossPrice;
    
    @DecimalMin("0.0")
    private Double toler;
    
    @Enumerated(EnumType.STRING)
    private OrderType orderType = OrderType.NORMAL;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    private OrderSide orderSide;
    
    private Double marketPrice;
    
    @Column(nullable = false)
    private LocalDate entryDate;
    
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private LocalTime entryTime;
    private LocalTime expiryTime;
    
    private Double buyingPower;
    private Double maxQuantity;
    
    private LocalDate createdAt = LocalDate.now();
    private LocalTime createdAtTime = LocalTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getTriggerPrice() {
        return triggerPrice;
    }

    public void setTriggerPrice(Double triggerPrice) {
        this.triggerPrice = triggerPrice;
    }

    public Double getTrailingAmount() {
        return trailingAmount;
    }

    public void setTrailingAmount(Double trailingAmount) {
        this.trailingAmount = trailingAmount;
    }

    public Double getTakeProfitPrice() {
        return takeProfitPrice;
    }

    public void setTakeProfitPrice(Double takeProfitPrice) {
        this.takeProfitPrice = takeProfitPrice;
    }

    public Double getCutLossPrice() {
        return cutLossPrice;
    }

    public void setCutLossPrice(Double cutLossPrice) {
        this.cutLossPrice = cutLossPrice;
    }

    public Double getToler() {
        return toler;
    }

    public void setToler(Double toler) {
        this.toler = toler;
    }

    public OrderType getOrderType() {
        return orderType;
    }

    public void setOrderType(OrderType orderType) {
        this.orderType = orderType;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public OrderSide getOrderSide() {
        return orderSide;
    }

    public void setOrderSide(OrderSide orderSide) {
        this.orderSide = orderSide;
    }

    public Double getMarketPrice() {
        return marketPrice;
    }

    public void setMarketPrice(Double marketPrice) {
        this.marketPrice = marketPrice;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public LocalTime getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(LocalTime entryTime) {
        this.entryTime = entryTime;
    }

    public LocalTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public Double getBuyingPower() {
        return buyingPower;
    }

    public void setBuyingPower(Double buyingPower) {
        this.buyingPower = buyingPower;
    }

    public Double getMaxQuantity() {
        return maxQuantity;
    }

    public void setMaxQuantity(Double maxQuantity) {
        this.maxQuantity = maxQuantity;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public LocalTime getCreatedAtTime() {
        return createdAtTime;
    }

    public void setCreatedAtTime(LocalTime createdAtTime) {
        this.createdAtTime = createdAtTime;
    }
}
