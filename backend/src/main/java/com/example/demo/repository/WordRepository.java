package com.example.demo.repository;

import com.example.demo.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface WordRepository extends JpaRepository<Word, Long> {
    List<Word> findByDifficulty(String difficulty);

    @Query(value = "SELECT * FROM words ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Word findRandomWord();
    
    @Query(value = "SELECT * FROM words WHERE difficulty = :difficulty ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Word findRandomWordByDifficulty(String difficulty);

    @Query(value = "SELECT * FROM words WHERE category = :category ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Word findRandomWordByCategory(String category);

    @Query(value = "SELECT * FROM words WHERE difficulty = :difficulty AND category = :category ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Word findRandomWordByDifficultyAndCategory(String difficulty, String category);
}
