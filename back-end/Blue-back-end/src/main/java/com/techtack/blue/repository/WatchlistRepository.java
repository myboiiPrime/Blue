package com.techtack.blue.repository;

import com.techtack.blue.model.User;
import com.techtack.blue.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUser(User user);
    boolean existsByNameAndUser(String name, User user);
}