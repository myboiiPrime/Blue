package com.techtack.blue.repository;

import com.techtack.blue.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    public User findByEmail(String email);
    public User findByFullName(String fullName);
    public User mobile(String mobile);
    public User password(String password);
    public User location(String location);

    @Query("SELECT DISTINCT u FROM User u WHERE u.fullName LIKE %:query% OR u.email LIKE %:query%")
    public List<User> searchUser(@Param("query") String query);
}
