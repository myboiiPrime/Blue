package com.techtack.blue.controller;

import com.techtack.blue.dto.UserStockDto;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.User;
import com.techtack.blue.service.UserService;
import com.techtack.blue.service.UserStockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-stocks")
public class UserStockController {

    @Autowired
    private UserStockService userStockService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/portfolio")
    public ResponseEntity<?> getUserPortfolio() {
        try {
            User user = userService.findUserProfileByJwt(null);
            List<UserStockDto> portfolio = userStockService.getUserStocks(user.getId());
            return new ResponseEntity<>(portfolio, HttpStatus.OK);
        } catch (UserException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/buy")
    public ResponseEntity<?> buyStock(
            @RequestParam String symbol,
            @RequestParam int quantity) {
        try {
            User user = userService.findUserProfileByJwt(null);
            UserStockDto userStock = userStockService.buyStock(user.getId(), symbol, quantity);
            return new ResponseEntity<>(userStock, HttpStatus.OK);
        } catch (UserException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/sell")
    public ResponseEntity<?> sellStock(
            @RequestParam String symbol,
            @RequestParam int quantity) {
        try {
            User user = userService.findUserProfileByJwt(null);
            UserStockDto userStock = userStockService.sellStock(user.getId(), symbol, quantity);
            return new ResponseEntity<>(userStock != null ? userStock : "Stock sold successfully", HttpStatus.OK);
        } catch (UserException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}