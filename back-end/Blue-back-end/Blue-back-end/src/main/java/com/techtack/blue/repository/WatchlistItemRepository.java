package com.techtack.blue.repository;

import com.techtack.blue.model.Stock;
import com.techtack.blue.model.Watchlist;
import com.techtack.blue.model.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {
    WatchlistItem findByWatchlistAndStock(Watchlist watchlist, Stock stock);
    boolean existsByWatchlistAndStock(Watchlist watchlist, Stock stock);
    List<WatchlistItem> findByWatchlist(Watchlist watchlist);
}