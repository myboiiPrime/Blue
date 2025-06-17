package com.techtack.blue.service;

import com.techtack.blue.config.JwtProvider;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.User;
import com.techtack.blue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtProvider jwtProvider;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
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
    
    public User updateUsername(Long userId, String fullName) {
        User user = findUserById(userId);
        user.setFullName(fullName);
        return userRepository.save(user);
    }
    
    public User updatePassword(Long userId, String oldPassword, String newPassword) {
        User user = findUserById(userId);
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        
        // Update with new password
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}
