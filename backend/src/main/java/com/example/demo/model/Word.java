package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "words")
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;
    private String difficulty;
    private String category;

    @Column(length = 1000)
    private String meaning;

    public Word() {}
    public Word(String content, String difficulty) {
        this.content = content;
        this.difficulty = difficulty;
        this.category = "GENEL";
        this.meaning = "İpucu bulunamadı.";
    }
    public Word(String content, String difficulty, String category, String meaning) {
        this.content = content;
        this.difficulty = difficulty;
        this.category = category;
        this.meaning = meaning != null ? meaning : "İpucu bulunamadı.";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }
}
