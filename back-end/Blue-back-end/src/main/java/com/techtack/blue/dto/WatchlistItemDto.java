package com.techtack.blue.dto;

import java.time.LocalDateTime;

public class WatchlistItemDto {
    private Long id;
    private Long watchlistId;
    private StockDto stock;
    private LocalDateTime addedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWatchlistId() {
        return watchlistId;
    }

    public void setWatchlistId(Long watchlistId) {
        this.watchlistId = watchlistId;
    }

    public StockDto getStock() {
        return stock;
    }

    public void setStock(StockDto stock) {
        this.stock = stock;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}