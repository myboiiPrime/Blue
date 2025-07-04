package com.techtack.blue.model;

public enum OrderType {
    NORMAL("Normal Order"),
    GTD("GTD"),
    STOP("Stop"),
    STOP_LIMIT("Stop Limit"),
    TRAILING_STOP("Trailing Stop"),
    TRAILING_STOP_LIMIT("Trailing Stop Limit"),
    OCO("OCO"),
    STOP_LOSS_TAKE_PROFIT("Stop Loss/Take Profit");
    
    private final String displayName;
    
    OrderType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}