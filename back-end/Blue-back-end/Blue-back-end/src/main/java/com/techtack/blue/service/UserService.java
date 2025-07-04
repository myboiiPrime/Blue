package com.techtack.blue.service;

import com.techtack.blue.config.JwtProvider;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.User;
import com.techtack.blue.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtProvider jwtProvider;
    
    @Autowired
    private HttpServletRequest request;
    
    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findUserProfileByJwt(String jwt) {
        User user = (User) request.getAttribute("currentUser");
        
        if (user != null) {
            return user;
        }

        if (jwt != null) {
            String email = jwtProvider.getEmailFromToken(jwt);
            user = userRepository.findByEmail(email);
            
            if(user == null) {
                throw new RuntimeException("User not found with email: " + email);
            }
            return user;
        }
        throw new RuntimeException("User not authenticated");
    }

    public User findUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }
    
    public User updateUser(User user, Long userId) throws UserException {
        Optional<User> optionalUser = userRepository.findById(userId);
        if(optionalUser.isPresent()) {
            User userToUpdate = optionalUser.get();
            
            // Check if the new fullName already exists for another user
            if (!userToUpdate.getFullName().equals(user.getFullName())) {
                User existingUser = userRepository.findByFullName(user.getFullName());
                if (existingUser != null && !existingUser.getId().equals(userId)) {
                    throw new UserException("User with name '" + user.getFullName() + "' already exists");
                }
            }
            
            userToUpdate.setEmail(user.getEmail());
            userToUpdate.setPassword(passwordEncoder.encode(user.getPassword()));
            userToUpdate.setFullName(user.getFullName());
            userToUpdate.setMobile(user.getMobile());
            return userRepository.save(userToUpdate);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }

    public boolean deleteUser(Long userId){
        if (userRepository.findById(userId).isPresent()) {
            userRepository.deleteById(userId);
            return true;
        } else  {
            return false;
        }
    }
}
