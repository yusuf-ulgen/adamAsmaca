package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    private final UserRepository userRepository;

    public LeaderboardController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getTopPlayers(@RequestParam(required = false) String category) {
        List<User> users = userRepository.findAll();
        
        if (category != null && !category.isEmpty() && !"GENEL".equalsIgnoreCase(category)) {
            return users.stream()
                .sorted((u1, u2) -> {
                    int w1 = u1.getCategoryWins() != null ? u1.getCategoryWins().getOrDefault(category, 0) : 0;
                    int w2 = u2.getCategoryWins() != null ? u2.getCategoryWins().getOrDefault(category, 0) : 0;
                    return Integer.compare(w2, w1);
                })
                .limit(10)
                .collect(java.util.stream.Collectors.toList());
        }

        return users.stream()
                .sorted((u1, u2) -> Integer.compare(u2.getGamesWon(), u1.getGamesWon()))
                .limit(10)
                .collect(java.util.stream.Collectors.toList());
    }
}
