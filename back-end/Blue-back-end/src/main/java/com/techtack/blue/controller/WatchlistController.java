package com.techtack.blue.controller;

import com.techtack.blue.dto.WatchlistDto;
import com.techtack.blue.dto.WatchlistItemDto;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/watchlists")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @PostMapping
    public ResponseEntity<WatchlistDto> createWatchlist(
            @RequestBody WatchlistDto watchlistDto,
            @RequestParam("userId") Long userId) throws UserException {
        return ResponseEntity.ok(watchlistService.createWatchlist(watchlistDto, userId));
    }

    @GetMapping
    public ResponseEntity<List<WatchlistDto>> getUserWatchlists(
            @RequestParam("userId") Long userId) {
        return ResponseEntity.ok(watchlistService.getUserWatchlists(userId));
    }

    @GetMapping("/{watchlistId}")
    public ResponseEntity<WatchlistDto> getWatchlistById(
            @PathVariable Long watchlistId,
            @RequestParam("userId") Long userId) {
        return ResponseEntity.ok(watchlistService.getWatchlistById(watchlistId, userId));
    }

    @PutMapping("/{watchlistId}")
    public ResponseEntity<WatchlistDto> updateWatchlist(
            @PathVariable Long watchlistId,
            @RequestBody WatchlistDto watchlistDto,
            @RequestParam("userId") Long userId) throws UserException {
        return ResponseEntity.ok(watchlistService.updateWatchlist(watchlistId, watchlistDto, userId));
    }

    @DeleteMapping("/{watchlistId}")
    public ResponseEntity<Void> deleteWatchlist(
            @PathVariable Long watchlistId,
            @RequestParam("userId") Long userId) {
        watchlistService.deleteWatchlist(watchlistId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{watchlistId}/stocks")
    public ResponseEntity<WatchlistItemDto> addStockToWatchlist(
            @PathVariable Long watchlistId,
            @RequestParam Long stockId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(watchlistService.addStockToWatchlist(watchlistId, stockId, userId));
    }

    @DeleteMapping("/{watchlistId}/stocks/{stockItemId}")
    public ResponseEntity<Void> removeStockFromWatchlist(
            @PathVariable Long watchlistId,
            @PathVariable Long stockItemId,
            @RequestParam Long userId) {
        watchlistService.removeStockFromWatchlist(watchlistId, stockItemId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{watchlistId}/stocks")
    public ResponseEntity<List<WatchlistItemDto>> getWatchlistStocks(
            @PathVariable Long watchlistId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(watchlistService.getWatchlistItems(watchlistId, userId));
    }
}
