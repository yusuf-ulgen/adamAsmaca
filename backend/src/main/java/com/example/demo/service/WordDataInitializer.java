package com.example.demo.service;

import com.example.demo.model.Word;
import com.example.demo.repository.WordRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class WordDataInitializer implements ApplicationRunner {

    private final WordRepository wordRepository;

    public WordDataInitializer(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (wordRepository.count() > 0) return;

        // Technology
        List<String> techWords = Arrays.asList("ALGORİTMA", "YAZILIM", "DONANIM", "VERİTABANI", "ARAYÜZ", "SUNUCU", "İŞLEMCİ", "BELLEK", "İNTERNET", "SİBER");
        for (String w : techWords) wordRepository.save(new Word(w, getDiff(w), "TEKNOLOJI"));

        // Cinema
        List<String> movieWords = Arrays.asList("YÖNETMEN", "SENARYO", "OYUNCU", "KURGU", "KAMERA", "MİSANSEN", "REPLİK", "FRAGMAN", "BELGESEL", "ANİMASYON");
        for (String w : movieWords) wordRepository.save(new Word(w, getDiff(w), "SINEMA"));

        // Geography
        List<String> geoWords = Arrays.asList("OKYANUS", "DAĞLAR", "NEHİRLER", "KITA", "ADA", "BOĞAZ", "VADİ", "PLATİNLER", "EKVATOR", "MERİDYEN");
        for (String w : geoWords) wordRepository.save(new Word(w, getDiff(w), "COGRAFYA"));

        // Mythology
        List<String> mythWords = Arrays.asList("ZEUS", "POSEIDON", "HADES", "APHRODITE", "HERCULES", "OLYMPUS", "PEGASUS", "PHOENIX", "VALHALLA", "ANUBIS");
        for (String w : mythWords) wordRepository.save(new Word(w, getDiff(w), "MITOLOJI"));

        // General
        List<String> generalWords = Arrays.asList("ELMA", "ARMUT", "ANKARA", "İSTANBUL", "DEMOKRASİ", "ÖZGÜRLÜK", "ADALET", "İHTİYAT", "METAFOR", "İLMİHAL");
        for (String w : generalWords) wordRepository.save(new Word(w, getDiff(w), "GENEL"));
        
        System.out.println("Word pool initialized with categorized words.");
    }

    private String getDiff(String word) {
        if (word.length() <= 5) return "EASY";
        if (word.length() >= 9) return "HARD";
        return "MEDIUM";
    }
}
