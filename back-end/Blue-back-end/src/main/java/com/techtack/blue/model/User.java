package com.techtack.blue.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.techtack.blue.dto.UserDto;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String fullName;
    private String location;
    private String birthDate;
    private String email;
    private String password;
    private String mobile;
    private String image;
    private double accountBalance;
    private boolean req_user;
    private boolean login_with_google;
    private boolean login_with_facebook;
    private boolean verified;
    private LocalDateTime verificationStartTime;
    private LocalDateTime verificationEndTime;

    public User(Long id, String fullName, String location, String birthDate, String email, String password, String mobile, String image, boolean req_user, boolean login_with_google, boolean login_with_facebook) {
        this.id = id;
        this.fullName = fullName;
        this.location = location;
        this.birthDate = birthDate;
        this.email = email;
        this.password = password;
        this.mobile = mobile;
        this.image = image;
        this.req_user = req_user;
        this.login_with_google = login_with_google;
        this.login_with_facebook = login_with_facebook;
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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public boolean isReq_user() {
        return req_user;
    }

    public void setReq_user(boolean req_user) {
        this.req_user = req_user;
    }

    public boolean isLogin_with_google() {
        return login_with_google;
    }

    public void setLogin_with_google(boolean login_with_google) {
        this.login_with_google = login_with_google;
    }

    public boolean isLogin_with_facebook() {
        return login_with_facebook;
    }

    public void setLogin_with_facebook(boolean login_with_facebook) {
        this.login_with_facebook = login_with_facebook;
    }

    public boolean getLogin_with_google() {
        return login_with_google;
    }
    
    public double getAccountBalance() {
        return accountBalance;
    }

    public void setAccountBalance(double accountBalance) {
        this.accountBalance = accountBalance;
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
}
