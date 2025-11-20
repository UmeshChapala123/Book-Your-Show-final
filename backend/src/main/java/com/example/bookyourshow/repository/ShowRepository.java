package com.example.bookyourshow.repository;

import com.example.bookyourshow.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {
    List<Show> findByTheatreId(Long theatreId);
    List<Show> findByMovieTitleContainingIgnoreCase(String movieTitle);
}

