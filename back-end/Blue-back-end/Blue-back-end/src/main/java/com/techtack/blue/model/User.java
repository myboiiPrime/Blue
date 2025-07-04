package com.techtack.blue.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String fullName;
    private String location;
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
    private double buyingPower = 0.0;

    public User(Long id, String fullName, String location, String email, String password, String mobile, String identification_card, boolean req_user) {
        this.id = id;
        this.fullName = fullName;
        this.location = location;
        this.email = email;
        this.password = password;
        this.mobile = mobile;
        this.identification_card = identification_card;
        this.req_user = req_user;
        this.buyingPower = 0.0;
    }

    public User() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public double getBuyingPower() {
        return buyingPower;
    }

    public void setBuyingPower(double buyingPower) {
        this.buyingPower = buyingPower;
    }
}
