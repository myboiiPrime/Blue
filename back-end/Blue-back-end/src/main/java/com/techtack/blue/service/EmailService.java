package com.techtack.blue.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    public void sendVerificationEmail(String to, String verificationUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            
            helper.setFrom("noreply@bluestock.com");
            helper.setTo(to);
            helper.setSubject("Please verify your email address");
            
            String emailContent = 
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;'>" +
                "<h2 style='color: #0066cc;'>Email Verification</h2>" +
                "<p>Thank you for registering with Blue Stock. Please click the link below to verify your email address:</p>" +
                "<p><a href='" + verificationUrl + "' style='display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px;'>Verify Email</a></p>" +
                "<p>If the button doesn't work, you can copy and paste the following link into your browser:</p>" +
                "<p><a href='" + verificationUrl + "'>" + verificationUrl + "</a></p>" +
                "<p>This link will expire in 24 hours.</p>" +
                "<p>If you did not create an account, please ignore this email.</p>" +
                "</div>";
            
            helper.setText(emailContent, true);
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }
    }

    public void sendPasswordChangeVerificationEmail(String toEmail, String verificationUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            
            helper.setFrom("noreply@bluestock.com");
            helper.setTo(toEmail);
            helper.setSubject("Verify Your Password Change");
            
            String emailContent = 
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;'>" +
                "<h2 style='color: #0066cc;'>Password Change Verification</h2>" +
                "<p>You have requested to change your password. Please click the link below to verify this change:</p>" +
                "<p><a href='" + verificationUrl + "' style='display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px;'>Verify Password Change</a></p>" +
                "<p>If you did not request this change, please ignore this email.</p>" +
                "</div>";
            
            helper.setText(emailContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send password change verification email: " + e.getMessage());
        }
    }
}