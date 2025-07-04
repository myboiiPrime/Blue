package com.techtack.blue.repository;

import com.techtack.blue.model.Account;
import com.techtack.blue.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByIdAndUser(Long accountId, User user);
    boolean existsByIdAndUser(Long accountId, User user);
}
