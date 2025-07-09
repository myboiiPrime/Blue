package com.techtack.blue.model;

import com.techtack.blue.dto.UserDto;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name="secureTokens")
public class SecureToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String token;

    @Column(updatable = false)
    @Basic(optional = false)
    private LocalDateTime expiryAt;

    @ManyToOne
    private User user;
}