package com.techtack.blue.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private String username;
    private String location;
    private String birthDate;
    private String email;
    private String password;
    private String mobile;
    private String identification_card;
    private double accountBalance;
    private boolean req_user;
    private boolean verified;
    private LocalDateTime verificationStartTime;
    private LocalDateTime verificationEndTime;
    private String token;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getIdentification_card() {
        return identification_card;
    }

    public void setIdentification_card(String identification_card) {
        this.identification_card = identification_card;
    }

    public double getAccountBalance() {
        return accountBalance;
    }

    public void setAccountBalance(double accountBalance) {
        this.accountBalance = accountBalance;
    }

    public boolean isReq_user() {
        return req_user;
    }

    public void setReq_user(boolean req_user) {
        this.req_user = req_user;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getVerificationStartTime() {
        return verificationStartTime;
    }

    public void setVerificationStartTime(LocalDateTime verificationStartTime) {
        this.verificationStartTime = verificationStartTime;
    }

    public LocalDateTime getVerificationEndTime() {
        return verificationEndTime;
    }

    public void setVerificationEndTime(LocalDateTime verificationEndTime) {
        this.verificationEndTime = verificationEndTime;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
