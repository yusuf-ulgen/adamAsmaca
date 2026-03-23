package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final com.example.demo.service.AchievementService achievementService;

    public UserController(UserRepository userRepository, com.example.demo.service.AchievementService achievementService) {
        this.userRepository = userRepository;
        this.achievementService = achievementService;
    }

    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return null;
        String email = principal.getAttribute("email");
        return userRepository.findByEmail(email).orElse(null);
    }

    @PostMapping("/update-stats")
    public User updateStats(@RequestBody Map<String, Object> stats, @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return null;
        String email = principal.getAttribute("email");
        User user = userRepository.findByEmail(email).orElseThrow();

        boolean won = (boolean) stats.get("won");
        int mistakes = (int) stats.getOrDefault("mistakes", 0);
        int timeInSeconds = (int) stats.getOrDefault("timeInSeconds", 0);
        int wordLength = (int) stats.getOrDefault("wordLength", 0);
        String category = (String) stats.getOrDefault("category", "GENEL");

        if (won) {
            user.setGamesWon(user.getGamesWon() + 1);
            user.setCurrentStreak(user.getCurrentStreak() + 1);
            
            // Category Wins
            user.getCategoryWins().put(category, user.getCategoryWins().getOrDefault(category, 0) + 1);
            
            // Calculate Multiplier
            double multiplier = 1.0;
            if (user.getCurrentStreak() >= 10) multiplier = 2.0;
            else if (user.getCurrentStreak() >= 5) multiplier = 1.5;
            else if (user.getCurrentStreak() >= 3) multiplier = 1.2;
            
            int baseGold = 30;
            int finalGold = (int) (baseGold * multiplier);
            user.setGold(user.getGold() + finalGold);
            
            // Highscore logic
            user.setHighScore(user.getHighScore() + (int)(100 * multiplier));
            
            // Check achievements
            achievementService.checkAndAward(user, won, mistakes, timeInSeconds, wordLength);
        } else {
            user.setGamesLost(user.getGamesLost() + 1);
            user.setCurrentStreak(0); // Reset streak
            user.setGold(user.getGold() + 5);
        }

        return userRepository.save(user);
    }

    @PostMapping("/buy")
    public User buyItem(@RequestBody Map<String, String> request, @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return null;
        String email = principal.getAttribute("email");
        User user = userRepository.findByEmail(email).orElseThrow();

        String item = request.get("item");
        int cost = Integer.parseInt(request.get("cost"));

        if (user.getGold() >= cost) {
            user.setGold(user.getGold() - cost);
            user.getInventory().add(item);
            return userRepository.save(user);
        } else {
            throw new RuntimeException("Not enough gold!");
        }
    }
}
