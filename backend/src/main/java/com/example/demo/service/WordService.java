package com.example.demo.service;

import com.example.demo.model.WordResponse;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class WordService {

    private final List<String> wordPool = Arrays.asList(
        "ELMA", "ARMUT", "KİRAZ", "VİŞNE", "KAYISI", // Easy
        "BİLGİSAYAR", "PROGRAMLAMA", "MÜHENDİS", "TELEFON", "TELEVİZYON", // Hard
        "KİTAPLIK", "PENCERE", "MASA", "SANDALYE", "MUTFAK", // Medium
        "ADAMASMACA", "TASARIM", "ARAYÜZ", "GELİŞTİRİCİ", "YAZILIM",
        "ZÜRAFA", "FİL", "ASLAN", "KAPLAN", "MAYMUN",
        "TÜRKİYE", "İSTANBUL", "ANKARA", "İZMİR", "BURSA"
    );

    public WordResponse getRandomWord(String difficulty) {
        List<String> filtered = wordPool.stream()
            .filter(w -> {
                if ("EASY".equalsIgnoreCase(difficulty)) return w.length() <= 5;
                if ("MEDIUM".equalsIgnoreCase(difficulty)) return w.length() > 5 && w.length() <= 8;
                if ("HARD".equalsIgnoreCase(difficulty)) return w.length() > 8;
                return true; // General pool
            })
            .collect(Collectors.toList());

        if (filtered.isEmpty()) filtered = wordPool;

        String word = filtered.get(new Random().nextInt(filtered.size()));
        return new WordResponse(word, getDifficultyLabel(word));
    }

    private String getDifficultyLabel(String word) {
        if (word.length() <= 5) return "EASY";
        if (word.length() <= 8) return "MEDIUM";
        return "HARD";
    }
}
