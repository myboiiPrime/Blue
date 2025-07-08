package com.techtack.blue.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.techtack.blue.dto.StockDto;
import com.techtack.blue.dto.WatchlistDto;
import com.techtack.blue.dto.WatchlistItemDto;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.Stock;
import com.techtack.blue.model.User;
import com.techtack.blue.model.Watchlist;
import com.techtack.blue.model.WatchlistSymbol;
import com.techtack.blue.repository.StockRepository;
import com.techtack.blue.repository.UserRepository;
import com.techtack.blue.repository.WatchlistSymbolRepository;
import com.techtack.blue.repository.WatchlistRepository;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockRepository stockRepository;
    
    @Autowired
    private WatchlistSymbolRepository watchlistSymbolRepository;

    // Create a new watchlist for a user
    @Transactional
    public WatchlistDto createWatchlist(WatchlistDto watchlistDto, Long userId) throws UserException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with id: " + userId
                ));
    
        // Check if watchlist with the same name already exists for this user
        if (watchlistRepository.existsByNameAndUser(watchlistDto.getName(), user)) {
            throw new UserException("Watchlist with name '" + watchlistDto.getName() + "' already exists");
        }
    
        Watchlist watchlist = new Watchlist();
        watchlist.setName(watchlistDto.getName());
        watchlist.setUser(user);
        watchlist = watchlistRepository.save(watchlist);
        return convertToDto(watchlist);
    }

    // Add a stock to a watchlist
    @Transactional
    public WatchlistItemDto addStockToWatchlist(Long watchlistId, Long stockId, Long userId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + watchlistId
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to add to this watchlist"
            );
        }
        
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Stock not found with id: " + stockId
                ));
        
        // Check if the stock is already in the watchlist
        if (watchlistSymbolRepository.existsByWatchlistAndStock(watchlist, stock)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Stock already exists in the watchlist"
            );
        }
        
        // Add to symbols list for backward compatibility
        watchlist.addSymbol(stock.getSymbol());
        watchlistRepository.save(watchlist);
        
        // Create and save the watchlist item
        WatchlistSymbol watchlistSymbol = new WatchlistSymbol();
        watchlistSymbol.setWatchlist(watchlist);
        watchlistSymbol.setStock(stock);
        watchlistSymbol = watchlistSymbolRepository.save(watchlistSymbol);
        
        return convertToItemDto(watchlistSymbol);
    }

    // Remove a stock from a watchlist
    @Transactional
    public void removeStockFromWatchlist(Long watchlistId, Long stockItemId, Long userId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + watchlistId
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to modify this watchlist"
            );
        }
        
        WatchlistSymbol watchlistSymbol = watchlistSymbolRepository.findById(stockItemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Stock item not found in watchlist with id: " + stockItemId
                ));
        
        // Verify the item belongs to the specified watchlist
        if (!watchlistSymbol.getWatchlist().getId().equals(watchlistId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stock item does not belong to the specified watchlist"
            );
        }
        
        // Remove from symbols list for backward compatibility
        watchlist.removeSymbol(watchlistSymbol.getStock().getSymbol());
        watchlistRepository.save(watchlist);
        
        // Delete the watchlist item
        watchlistSymbolRepository.delete(watchlistSymbol);
    }

    // Get all stocks in a watchlist
    public List<String> getWatchlistSymbols(Long watchlistId, Long userId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + watchlistId
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to view this watchlist"
            );
        }
        
        return watchlist.getSymbols();
    }
    
    // Get all watchlist items for a watchlist
    public List<WatchlistItemDto> getWatchlistItems(Long watchlistId, Long userId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + watchlistId
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to view this watchlist"
            );
        }
        
        List<WatchlistSymbol> watchlistSymbols = watchlistSymbolRepository.findByWatchlist(watchlist);
        return watchlistSymbols.stream()
                .map(this::convertToItemDto)
                .collect(Collectors.toList());
    }
    
    // Get all watchlists for a user
    public List<WatchlistDto> getUserWatchlists(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with id: " + userId
                ));
        
        List<Watchlist> watchlists = watchlistRepository.findByUser(user);
        return watchlists.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // Get a specific watchlist by ID
    public WatchlistDto getWatchlistById(Long watchlistId, Long userId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + watchlistId
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to view this watchlist"
            );
        }
        
        return convertToDto(watchlist);
    }
    
    // Update a watchlist
    @Transactional
    public WatchlistDto updateWatchlist(Long watchlistId, WatchlistDto watchlistDto, Long userId) throws UserException {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + watchlistId
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to update this watchlist"
            );
        }
        
        // Check if the new name conflicts with another watchlist owned by this user
        if (!watchlist.getName().equals(watchlistDto.getName()) && 
                watchlistRepository.existsByNameAndUser(watchlistDto.getName(), watchlist.getUser())) {
            throw new UserException("Watchlist with name '" + watchlistDto.getName() + "' already exists");
        }
        
        watchlist.setName(watchlistDto.getName());
        watchlist = watchlistRepository.save(watchlist);
        
        return convertToDto(watchlist);
    }
    
    // Delete a watchlist
    @Transactional
    public void deleteWatchlist(Long watchlistId, Long userId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + watchlistId
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to delete this watchlist"
            );
        }
        
        watchlistRepository.delete(watchlist);
    }

    // Helper method to convert Watchlist to WatchlistDto
    private WatchlistDto convertToDto(Watchlist watchlist) {
        WatchlistDto dto = new WatchlistDto();
        dto.setId(watchlist.getId());
        dto.setName(watchlist.getName());
        dto.setUserId(watchlist.getUser().getId());
        dto.setCreatedAt(watchlist.getCreatedAt());
        dto.setSymbols(watchlist.getSymbols());
        return dto;
    }
    
    // Helper method to convert WatchlistItem to WatchlistItemDto
    private WatchlistItemDto convertToItemDto(WatchlistSymbol watchlistSymbol) {
        WatchlistItemDto dto = new WatchlistItemDto();
        dto.setId(watchlistSymbol.getId());
        dto.setWatchlistId(watchlistSymbol.getWatchlist().getId());
        dto.setStock(convertToStockDto(watchlistSymbol.getStock()));
        dto.setAddedAt(watchlistSymbol.getAddedAt());
        return dto;
    }
    
    // Helper method to convert Stock to StockDto
    private StockDto convertToStockDto(Stock stock) {
        StockDto dto = new StockDto();
        dto.setId(stock.getId());
        dto.setSymbol(stock.getSymbol());
        dto.setName(stock.getName());
        dto.setPrice(stock.getPrice());
        dto.setOpen(stock.getOpen());
        dto.setHigh(stock.getHigh());
        dto.setLow(stock.getLow());
        dto.setPreviousClose(stock.getPreviousClose());
        dto.setVolume(stock.getVolume());
        dto.setLastUpdated(stock.getLastUpdated());
        dto.setChangeAmount(stock.getChange());
        dto.setChangePercent(stock.getChangePercent());
        return dto;
    }
}
