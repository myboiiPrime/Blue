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
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private HttpServletRequest request;
    
    /**
     * Checks if the provided password matches the user's current password
     * @param password The password to check
     * @param user The user whose password to compare against
     * @return true if passwords match, false otherwise
     */
    public boolean isPasswordMatching(String password, User user) {
        Optional<User> optionalUser = Optional.ofNullable(user);
        if (!optionalUser.isPresent()) {
            return false;
        }
        
        Optional<String> optionalPassword = Optional.ofNullable(password);
        if (!optionalPassword.isPresent()) {
            return false;
        }
        
        return passwordEncoder.matches(optionalPassword.get(), optionalUser.get().getPassword());
    }
    
    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findUserProfileByJwt(String jwt) throws UserException {
        User user = (User) request.getAttribute("currentUser");
        
        Optional<User> optionalUser = Optional.ofNullable(user);
        if (optionalUser.isPresent()) {
            return optionalUser.get();
        }

        Optional<String> optionalJwt = Optional.ofNullable(jwt);
        if (optionalJwt.isPresent()) {
            String email = jwtProvider.getEmailFromToken(optionalJwt.get());
            return userRepository.findByEmail(email)
                .map(foundUser -> foundUser)
                .orElseThrow(() -> new UserException("User not found with email: " + email));
        }
        throw new UserException("User not authenticated");
    }

    public User findUserById(Long userId) throws UserException {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));
    }
    
    public User updateUser(User user, Long userId) throws UserException {
        User userToUpdate = userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));
        
        // Check username
        if (!userToUpdate.getUsername().equals(user.getUsername())) {
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
            if (existingUser.isPresent()) {
                throw new UserException("Username already exists");
            }
        }
        
        // Check email
        if (!userToUpdate.getEmail().equals(user.getEmail())) {
            Optional<User> existingUserOpt = userRepository.findByEmail(user.getEmail());
            if (existingUserOpt.isPresent() && !existingUserOpt.get().getId().equals(userId)) {
                throw new UserException("User with email already exists");
            }
        }
        
        // Check mobile
        if (!userToUpdate.getMobile().equals(user.getMobile())) {
            Optional<User> existingUserOpt = userRepository.findByMobile(user.getMobile());
            if (existingUserOpt.isPresent() && !existingUserOpt.get().getId().equals(userId)) {
                throw new UserException("User with mobile number already exists");
            }
        }

        // Check password
        if (!userToUpdate.getPassword().equals(user.getPassword())) {
            Optional<User> existingUserOpt = userRepository.findByPassword(user.getPassword());
            if (existingUserOpt.isPresent() && !existingUserOpt.get().getId().equals(userId)) {
                throw new UserException("User password already exists");
            }
        }
        
        userToUpdate.setEmail(user.getEmail());
        userToUpdate.setPassword(passwordEncoder.encode(user.getPassword()));
        userToUpdate.setUsername(user.getUsername());
        userToUpdate.setMobile(user.getMobile());
        userToUpdate.setLocation(user.getLocation());
        userToUpdate.setIdentification_card(user.getIdentification_card());
        
        return userRepository.save(userToUpdate);
    }

    public boolean deleteUser(Long userId) throws UserException {
        userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));
        
        userRepository.deleteById(userId);
        return true;
    }
}
