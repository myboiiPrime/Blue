package com.techtack.blue.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.techtack.blue.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    public Optional<User> findByEmail(String email);
    public Optional<User> findByUsername(String username);
    public Optional<User> findByMobile(String mobile);
    public Optional<User> findByPassword(String password);
    public Optional<User> findByLocation(String location);

    @Query("SELECT DISTINCT u FROM User u WHERE u.username LIKE %:query% OR u.email LIKE %:query%")
    public List<User> searchUser(@Param("query") String query);
}