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

    public Word() {}
    public Word(String content, String difficulty) {
        this.content = content;
        this.difficulty = difficulty;
        this.category = "GENEL";
    }
    public Word(String content, String difficulty, String category) {
        this.content = content;
        this.difficulty = difficulty;
        this.category = category;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
