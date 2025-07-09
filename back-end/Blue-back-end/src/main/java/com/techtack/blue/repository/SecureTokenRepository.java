package com.techtack.blue.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.techtack.blue.model.SecureToken;

public interface SecureTokenRepository extends JpaRepository<SecureToken, Long> {
    SecureToken findByToken(String token);
    void deleteByToken(String token);
}