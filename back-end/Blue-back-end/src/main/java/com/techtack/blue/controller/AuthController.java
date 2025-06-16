package com.techtack.blue.controller;

import com.techtack.blue.config.JwtProvider;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.User;
import com.techtack.blue.repository.UserRepository;
import com.techtack.blue.response.AuthResponse;
import com.techtack.blue.service.CustomUserDetailsServiceImplementation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private CustomUserDetailsServiceImplementation customUserDetails;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody User user) throws UserException {
        
        User isEmailExist = userRepository.findByEmail(user.getEmail());
        
        if (isEmailExist != null) {
            throw new UserException("Email is already registered");
        }
        
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setFullName(user.getFullName());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setMobile(user.getMobile());
        newUser.setAccountBalance(0.0);
        
        // Set verification details
        newUser.setVerified(false);
        newUser.setVerificationStartTime(LocalDateTime.now());
        newUser.setVerificationEndTime(LocalDateTime.now().plusDays(1));
        
        User savedUser = userRepository.save(newUser);
        
        Authentication authentication = new UsernamePasswordAuthenticationToken(savedUser.getEmail(), savedUser.getPassword());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String token = jwtProvider.generateToken(authentication);
        
        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(token);
        authResponse.setMessage("Register Success. Please verify your email.");
        
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }
    
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody User user) {
        String email = user.getEmail();
        String password = user.getPassword();
        
        Authentication authentication = authenticate(email, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String token = jwtProvider.generateToken(authentication);
        
        User loggedInUser = userRepository.findByEmail(email);
        
        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(token);
        
        if (!loggedInUser.isVerified()) {
            authResponse.setMessage("Login Success. Please verify your email to access all features.");
        } else {
            authResponse.setMessage("Login Success");
        }
        
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestParam String email) throws UserException {
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        
        if (user.isVerified()) {
            throw new UserException("Email already verified");
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(user.getVerificationEndTime())) {
            throw new UserException("Verification link expired. Please request a new one.");
        }
        
        user.setVerified(true);
        userRepository.save(user);
        
        AuthResponse response = new AuthResponse();
        response.setMessage("Email verified successfully");
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<AuthResponse> resendVerification(@RequestParam String email) throws UserException {
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        
        if (user.isVerified()) {
            throw new UserException("Email already verified");
        }
        
        // Reset verification times
        user.setVerificationStartTime(LocalDateTime.now());
        user.setVerificationEndTime(LocalDateTime.now().plusDays(1));
        userRepository.save(user);
        
        AuthResponse response = new AuthResponse();
        response.setMessage("Verification email resent successfully");
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@RequestParam String email) throws UserException {
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        
        // In a real application, you would generate a reset token and send it via email
        // For this example, we'll just update the verification times
        user.setVerificationStartTime(LocalDateTime.now());
        user.setVerificationEndTime(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        AuthResponse response = new AuthResponse();
        response.setMessage("Password reset instructions sent to your email");
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@RequestBody Map<String, String> request) throws UserException {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        
        if (email == null || newPassword == null) {
            throw new UserException("Email and new password are required");
        }
        
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(user.getVerificationEndTime())) {
            throw new UserException("Password reset link expired. Please request a new one.");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        AuthResponse response = new AuthResponse();
        response.setMessage("Password reset successfully");
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = customUserDetails.loadUserByUsername(username);
        
        if (userDetails == null) {
            throw new BadCredentialsException("Invalid username");
        }
        
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }
        
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }
}
