package com.example.demo.service;

import com.example.demo.model.Word;
import com.example.demo.repository.WordRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
public class WordDataInitializer implements ApplicationRunner {

    private final WordRepository wordRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WordDataInitializer(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (wordRepository.count() > 0) return;

        try {
            InputStream inputStream;
            File localFile = new File("src/main/resources/words.json");
            if (localFile.exists()) {
                inputStream = new FileInputStream(localFile);
            } else {
                inputStream = new ClassPathResource("words.json").getInputStream();
            }
            
            try (inputStream) {
                TypeReference<Map<String, List<Map<String, String>>>> typeReference = new TypeReference<>() {};
                Map<String, List<Map<String, String>>> categoryWords = objectMapper.readValue(inputStream, typeReference);

                for (Map.Entry<String, List<Map<String, String>>> entry : categoryWords.entrySet()) {
                    String category = entry.getKey();
                    for (Map<String, String> wObj : entry.getValue()) {
                        String w = wObj.get("word");
                        String meaning = wObj.get("meaning");
                        wordRepository.save(new Word(w.toUpperCase(), getDiff(w), category, meaning));
                    }
                }
                System.out.println("Word pool initialized from words.json with categorized words.");
            }
        } catch (Exception e) {
            System.err.println("Could not load words from words.json: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getDiff(String word) {
        if (word.length() <= 5) return "EASY";
        if (word.length() >= 9) return "HARD";
        return "MEDIUM";
    }
}
