package com.techtack.blue.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class WatchlistDto {
    private Long id;
    private String name;
    private Long userId;
    private LocalDateTime createdAt;
    private List<WatchlistItemDto> items = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<WatchlistItemDto> getItems() {
        return items;
    }

    public void setItems(List<WatchlistItemDto> items) {
        this.items = items;
    }
}