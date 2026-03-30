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
        boolean hasCategory = category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category);
        boolean hasDifficulty = difficulty != null && !difficulty.trim().isEmpty() && !"ALL".equalsIgnoreCase(difficulty);

        if (hasCategory && hasDifficulty && difficulty != null && category != null) {
            word = wordRepository.findRandomWordByDifficultyAndCategory(difficulty.toUpperCase(), category.toUpperCase());
        } else if (hasCategory && category != null) {
            word = wordRepository.findRandomWordByCategory(category.toUpperCase());
        } else if (hasDifficulty && difficulty != null) {
            word = wordRepository.findRandomWordByDifficulty(difficulty.toUpperCase());
        } else {
            word = wordRepository.findRandomWord();
        }

        if (word == null) {
            return new WordResponse("ADAM ASMACA", "MEDIUM", "GENEL");
        }

        return new WordResponse(word.getContent(), word.getDifficulty(), word.getCategory() != null ? word.getCategory() : "GENEL");
    }
}
