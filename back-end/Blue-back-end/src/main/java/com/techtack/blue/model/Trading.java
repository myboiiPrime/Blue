package com.techtack.blue.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "tradings")
@Data
public class Trading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String symbol;
    private String accountId;
    private String orderId;

    @Min(0)
    private Double quantity;

    @DecimalMin("0.0")
    private Double price;
    
    @DecimalMin("0.0")
    private Double triggerPrice;
    
    //Trailing stop/limit
    @DecimalMin("0.0")
    private Double trailingAmount;

    //OCO
    @DecimalMin("0.0")
    private Double takeProfitPrice;

    @DecimalMin("0.0")
    private Double cutLossPrice;

    @DecimalMin("0.0")
    private Double toler;

    private String orderType;
    private String status;
    private Double marketPrice;
    private Long totalVolume;
    
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private LocalTime createdAt;
    
    private Double buying_power;
    private Double max_quantity;

    public Trading() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
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

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getMarketPrice() {
        return marketPrice;
    }

    public void setMarketPrice(Double marketPrice) {
        this.marketPrice = marketPrice;
    }

    public Long getTotalVolume() {
        return totalVolume;
    }

    public void setTotalVolume(Long totalVolume) {
        this.totalVolume = totalVolume;
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

    public LocalTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getBuying_power() {
        return buying_power;
    }

    public void setBuying_power(Double buying_power) {
        this.buying_power = buying_power;
    }

    public Double getMax_quantity() {
        return max_quantity;
    }

    public void setMax_quantity(Double max_quantity) {
        this.max_quantity = max_quantity;
    }
}
