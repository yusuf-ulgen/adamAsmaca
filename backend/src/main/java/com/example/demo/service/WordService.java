package com.example.demo.service;

import com.example.demo.model.Word;
import com.example.demo.model.WordResponse;
import com.example.demo.repository.WordRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;

@Service
public class WordService {

    private final WordRepository wordRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public WordService(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
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
            String meaning = getTDKMeaning("ADAM ASMACA");
            return new WordResponse("ADAM ASMACA", "MEDIUM", "GENEL", meaning);
        }

        String meaning = getTDKMeaning(word.getContent());
        return new WordResponse(word.getContent(), word.getDifficulty(), word.getCategory() != null ? word.getCategory() : "GENEL", meaning);
    }

    private String getTDKMeaning(String wordContent) {
        try {
            String url = "https://sozluk.gov.tr/gts?ara=" + wordContent;
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            if (root.isArray() && root.size() > 0) {
                JsonNode firstResult = root.get(0);
                if (firstResult.has("anlamlarListe")) {
                    JsonNode meanings = firstResult.get("anlamlarListe");
                    if (meanings.isArray() && meanings.size() > 0) {
                        return meanings.get(0).get("anlam").asText();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("TDK API Error: " + e.getMessage());
        }
        return "İpucu bulunamadı."; // Fallback
    }
}
