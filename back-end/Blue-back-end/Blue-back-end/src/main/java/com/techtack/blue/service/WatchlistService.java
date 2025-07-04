package com.techtack.blue.service;

import com.techtack.blue.dto.WatchlistDto;
import com.techtack.blue.dto.WatchlistItemDto;
import com.techtack.blue.model.Stock;
import com.techtack.blue.model.User;
import com.techtack.blue.model.Watchlist;
import com.techtack.blue.model.WatchlistItem;
import com.techtack.blue.repository.StockRepository;
import com.techtack.blue.repository.UserRepository;
import com.techtack.blue.exception.ResourceNotFoundException;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.repository.WatchlistItemRepository;
import com.techtack.blue.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private WatchlistItemRepository watchlistItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockRepository stockRepository;

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

    // Get all watchlists for a user
    public List<WatchlistDto> getUserWatchlists(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return watchlistRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get a specific watchlist by ID
    public WatchlistDto getWatchlistById(Long id, Long userId) {
        Watchlist watchlist = watchlistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + id
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to access this watchlist"
            );
        }
        
        return convertToDto(watchlist);
    }

    // Update a watchlist
    @Transactional
    public WatchlistDto updateWatchlist(Long id, WatchlistDto watchlistDto, Long userId) throws UserException {
        Watchlist watchlist = watchlistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + id
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to update this watchlist"
            );
        }
        
        // Check if another watchlist with the same name already exists for this user
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
    public void deleteWatchlist(Long id, Long userId) {
        Watchlist watchlist = watchlistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist not found with id: " + id
                ));
        
        if (!watchlist.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You don't have permission to delete this watchlist"
            );
        }
        
        watchlistRepository.delete(watchlist);
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
        if (watchlistItemRepository.existsByWatchlistAndStock(watchlist, stock)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Stock already exists in the watchlist"
            );
        }
        
        WatchlistItem item = new WatchlistItem();
        item.setWatchlist(watchlist);
        item.setStock(stock);
        item = watchlistItemRepository.save(item);
        
        return convertToItemDto(item);
    }

    // Remove a stock from a watchlist
    @Transactional
    public void removeStockFromWatchlist(Long watchlistId, Long itemId, Long userId) {
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
        
        WatchlistItem item = watchlistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Watchlist item not found with id: " + itemId
                ));
        
        if (!item.getWatchlist().getId().equals(watchlistId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Item does not belong to the specified watchlist"
            );
        }
        
        watchlistItemRepository.delete(item);
    }

    // Get all items in a watchlist
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
        
        return watchlistItemRepository.findByWatchlist(watchlist).stream()
                .map(this::convertToItemDto)
                .collect(Collectors.toList());
    }

    // Helper method to convert Watchlist to WatchlistDto
    private WatchlistDto convertToDto(Watchlist watchlist) {
        WatchlistDto dto = new WatchlistDto();
        dto.setId(watchlist.getId());
        dto.setName(watchlist.getName());
        dto.setUserId(watchlist.getUser().getId());
        dto.setCreatedAt(watchlist.getCreatedAt());
        
        // Convert items if needed
        if (watchlist.getItems() != null) {
            List<WatchlistItemDto> itemDtos = watchlist.getItems().stream()
                    .map(this::convertToItemDto)
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
        }
        
        return dto;
    }

    // Helper method to convert WatchlistItem to WatchlistItemDto
    private WatchlistItemDto convertToItemDto(WatchlistItem item) {
        WatchlistItemDto dto = new WatchlistItemDto();
        dto.setId(item.getId());
        dto.setWatchlistId(item.getWatchlist().getId());
        dto.setAddedAt(item.getAddedAt());
        
        // Convert Stock to StockDto if needed
        if (item.getStock() != null) {
            // Assuming you have a method to convert Stock to StockDto
            // dto.setStock(convertToStockDto(item.getStock()));
        }
        
        return dto;
    }
}
