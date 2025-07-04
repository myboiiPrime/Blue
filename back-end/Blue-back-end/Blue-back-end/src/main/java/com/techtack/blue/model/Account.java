package com.techtack.blue.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "accounts")
@Data
public class Account {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(unique = true, nullable = false)
    private String accountNumber;
    
    @Column(nullable = false)
    private String accountType;  // e.g., MARGIN, CASH
    
    @Column(nullable = false)
    private Double buyingPower = 0.0;
    
    @Column(nullable = false)
    private Double cashBalance = 0.0;
    
    @Column(nullable = false)
    private Double marketValue = 0.0;
    
    @Column(nullable = false)
    private Double totalValue = 0.0;
    
    @Column(nullable = false)
    private Boolean isActive = true;
}
