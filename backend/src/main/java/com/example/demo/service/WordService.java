package com.example.demo.service;

import com.example.demo.model.Word;
import com.example.demo.model.WordResponse;
import com.example.demo.repository.WordRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.util.Optional; // This might be used but lint said unused, I'll remove it if I'm sure but actually it doesn't hurt. 
// Wait, I'll just remove it.


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
        if (wordContent == null) return "İpucu bulunamadı.";
        
        // Normalize: trim, lowercase first then handle special Turkish chars
        String searchWord = wordContent.trim().toLowerCase(); 
        
        try {
            String url = "https://sozluk.gov.tr/gts?ara=" + searchWord;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            
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
