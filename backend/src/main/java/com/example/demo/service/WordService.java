package com.example.demo.service;

import com.example.demo.model.Word;
import com.example.demo.model.WordResponse;
import com.example.demo.repository.WordRepository;
import org.springframework.stereotype.Service;

@Service
public class WordService {

    private final WordRepository wordRepository;

    public WordService(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    public WordResponse getRandomWord(String difficulty, String category) {
        Word word;
        if (category != null && !category.isEmpty() && !"GENEL".equalsIgnoreCase(category)) {
            // Find in repo by difficulty AND category (or just category)
            // For now, let's keep the existing logic and we'll update the repo in next step
            word = wordRepository.findRandomWord(); 
        } else if (difficulty == null || difficulty.isEmpty() || "ALL".equalsIgnoreCase(difficulty)) {
            word = wordRepository.findRandomWord();
        } else {
            word = wordRepository.findRandomWordByDifficulty(difficulty.toUpperCase());
        }

        if (word == null) {
            return new WordResponse("ADAMASMACA", "MEDIUM", "GENEL");
        }

        return new WordResponse(word.getContent(), word.getDifficulty(), word.getCategory() != null ? word.getCategory() : "GENEL");
    }
}
