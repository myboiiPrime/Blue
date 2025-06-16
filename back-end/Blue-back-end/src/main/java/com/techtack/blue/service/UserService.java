package com.techtack.blue.service;

import com.techtack.blue.config.JwtProvider;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.User;
import com.techtack.blue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtProvider jwtProvider;
    
    public User findUserProfileByJwt(String jwt) {
        String email = jwtProvider.getEmailFromToken(jwt);
        User user = userRepository.findByEmail(email);
        
        if(user == null) {
            throw new RuntimeException("User not found with email: " + email);
        }
        
        return user;
    }

    public User findUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }
}
