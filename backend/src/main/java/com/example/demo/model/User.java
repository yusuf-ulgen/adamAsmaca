package com.example.demo.model;

import jakarta.persistence.*;
import java.util.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;
    private String name;
    private int gold = 0;
    private int gamesWon = 0;
    private int gamesLost = 0;
    private int highScore = 0;
    private int currentStreak = 0;

    @ElementCollection
    private Map<String, Integer> categoryWins = new HashMap<>();

    @ElementCollection
    private Set<String> inventory = new HashSet<>();

    @ElementCollection
    private Set<String> unlockedAchievements = new HashSet<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getGold() { return gold; }
    public void setGold(int gold) { this.gold = gold; }
    public int getGamesWon() { return gamesWon; }
    public void setGamesWon(int gamesWon) { this.gamesWon = gamesWon; }
    public int getGamesLost() { return gamesLost; }
    public void setGamesLost(int gamesLost) { this.gamesLost = gamesLost; }
    public int getHighScore() { return highScore; }
    public void setHighScore(int highScore) { this.highScore = highScore; }
    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
    public Map<String, Integer> getCategoryWins() { return categoryWins; }
    public void setCategoryWins(Map<String, Integer> categoryWins) { this.categoryWins = categoryWins; }
    public Set<String> getInventory() { return inventory; }
    public void setInventory(Set<String> inventory) { this.inventory = inventory; }
    public Set<String> getUnlockedAchievements() { return unlockedAchievements; }
    public void setUnlockedAchievements(Set<String> unlockedAchievements) { this.unlockedAchievements = unlockedAchievements; }
}
