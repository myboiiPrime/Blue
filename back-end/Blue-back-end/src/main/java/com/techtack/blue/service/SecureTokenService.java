package com.techtack.blue.service;

import com.techtack.blue.model.SecureToken;
import com.techtack.blue.model.User;
import com.techtack.blue.repository.SecureTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class SecureTokenService {

    @Autowired
    private SecureTokenRepository secureTokenRepository;
    
    public SecureToken createSecureToken(User user) {
        SecureToken secureToken = new SecureToken();
        secureToken.setToken(UUID.randomUUID().toString());
        secureToken.setExpiryAt(LocalDateTime.now().plusDays(1));
        secureToken.setUser(user);
        secureTokenRepository.save(secureToken);
        return secureToken;
    }
    
    public SecureToken findByToken(String token) {
        return secureTokenRepository.findByToken(token);
    }
    
    public void removeToken(SecureToken token) {
        secureTokenRepository.delete(token);
    }
    
    public boolean isTokenValid(SecureToken token) {
        return token != null && token.getExpiryAt().isAfter(LocalDateTime.now());
    }
}