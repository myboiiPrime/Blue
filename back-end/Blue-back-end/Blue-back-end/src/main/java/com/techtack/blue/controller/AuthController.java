package com.techtack.blue.controller;

import com.techtack.blue.config.JwtProvider;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.SecureToken;
import com.techtack.blue.model.User;
import com.techtack.blue.repository.UserRepository;
import com.techtack.blue.response.AuthResponse;
import com.techtack.blue.service.CustomUserDetailsServiceImplementation;
import com.techtack.blue.service.EmailService;
import com.techtack.blue.service.SecureTokenService;
import jakarta.validation.Valid;
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

    @Autowired
    private SecureTokenService secureTokenService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody User user) throws UserException {
        
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

        newUser.setVerified(false);
        newUser.setVerificationStartTime(LocalDateTime.now());
        newUser.setVerificationEndTime(LocalDateTime.now().plusDays(1));

        User savedUser = userRepository.save(newUser);

        SecureToken secureToken = secureTokenService.createSecureToken(savedUser);

        String verificationUrl = "http://localhost:8080/auth/verify?token=" + secureToken.getToken();

        emailService.sendVerificationEmail(savedUser.getEmail(), verificationUrl);
        
        AuthResponse authResponse = new AuthResponse();
        authResponse.setMessage("Registration successful. Please check your email to verify your account.");
        
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@Valid @RequestParam String token) {
        SecureToken secureToken = secureTokenService.findByToken(token);
        
        if (secureToken == null) {
            return ResponseEntity.badRequest().body("Invalid verification token");
        }
        
        if (!secureTokenService.isTokenValid(secureToken)) {
            return ResponseEntity.badRequest().body("Verification token has expired");
        }
        
        User user = secureToken.getUser();
        user.setVerified(true);
        userRepository.save(user);
        secureTokenService.removeToken(secureToken);

        return ResponseEntity.ok("Email verified successfully. You can now login.");
    }
    
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody User user) {
        String email = user.getEmail();
        String password = user.getPassword();
        
        try {
            Authentication authentication = authenticate(email, password);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            String token = jwtProvider.generateToken(authentication);
            
            User loggedInUser = userRepository.findByEmail(email);
            loggedInUser.setToken(token);
            userRepository.save(loggedInUser);
            
            AuthResponse authResponse = new AuthResponse();
            authResponse.setJwt(token);
            
            if (!loggedInUser.isVerified()) {
                authResponse.setMessage("Login Success. Please verify your email to access all features.");
            } else {
                authResponse.setMessage("Login Success");
            }
            
            return new ResponseEntity<>(authResponse, HttpStatus.OK);
        } catch (BadCredentialsException e) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setMessage("Wrong account or password");
            return new ResponseEntity<>(authResponse, HttpStatus.UNAUTHORIZED);
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(@Valid @RequestBody Map<String, String> request) throws UserException {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        
        if (email == null || newPassword == null) {
            throw new UserException("Email and new password are required");
        }
        
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        
        if (!user.isReq_user()) {
            throw new UserException("Please request password reset first");
        }
        
        // Check if the new password is the same as the old one
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new UserException("New password must be different from the current password");
        }
        
        SecureToken verificationToken = secureTokenService.createSecureToken(user);
        String verificationUrl = "http://localhost:8080/auth/verify-password-change?token=" + verificationToken.getToken();
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerified(false);
        userRepository.save(user);
        
        emailService.sendPasswordChangeVerificationEmail(user.getEmail(), verificationUrl);
        
        AuthResponse response = new AuthResponse();
        response.setMessage("Password change verification email sent. Please check your email.");
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody Map<String, String> request) throws UserException {
        String email = request.get("email");

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        
        user.setReq_user(true);
        userRepository.save(user);

        SecureToken changepasswordToken = secureTokenService.createSecureToken(user);
        String changepasswordUrl = "http://localhost:8080/auth/change-password?token=" + changepasswordToken.getToken();

        AuthResponse response = new AuthResponse();
        response.setMessage("Please enter your new password");

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @GetMapping("/verify-password-change")
    public ResponseEntity<?> verifyPasswordChange(@Valid @RequestParam String token) {
        SecureToken secureToken = secureTokenService.findByToken(token);
        
        if (secureToken == null) {
            return ResponseEntity.badRequest().body("Invalid verification token");
        }
        
        if (!secureTokenService.isTokenValid(secureToken)) {
            return ResponseEntity.badRequest().body("Verification token has expired");
        }
        
        User user = secureToken.getUser();
        user.setVerified(true);
        user.setReq_user(false);
        userRepository.save(user);
        
        secureTokenService.removeToken(secureToken);
        
        return ResponseEntity.ok("Password changed successfully. You can now login with your new password.");
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
