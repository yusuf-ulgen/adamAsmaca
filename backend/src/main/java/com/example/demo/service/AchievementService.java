package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AchievementService {

    private final UserRepository userRepository;

    public AchievementService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void checkAndAward(User user, boolean won, int mistakes, int timeInSeconds, int wordLength) {
        Set<String> unlocked = user.getUnlockedAchievements();
        int bonusGold = 0;

        if (won) {
            // 1. İlk Bilgi
            if (!unlocked.contains("İlk Bilgi")) {
                unlocked.add("İlk Bilgi");
                bonusGold += 20;
            }

            // 2. Kusursuz
            if (mistakes == 0 && !unlocked.contains("Kusursuz")) {
                unlocked.add("Kusursuz");
                bonusGold += 100;
            }

            // 3. Hızlı Düşünür
            if (timeInSeconds < 10 && !unlocked.contains("Hızlı Düşünür")) {
                unlocked.add("Hızlı Düşünür");
                bonusGold += 150;
            }

            // 4. Kelime Avcısı
            if (wordLength >= 10 && !unlocked.contains("Kelime Avcısı")) {
                unlocked.add("Kelime Avcısı");
                bonusGold += 200;
            }

            // 5. Şanslı (Assuming max mistakes is dynamic, 1 left means mistakes == max-1)
            // For now, let's just award if mistakes were high
            if (mistakes >= 5 && !unlocked.contains("Şanslı")) {
                unlocked.add("Şanslı");
                bonusGold += 75;
            }
        }

        user.setGold(user.getGold() + bonusGold);
        userRepository.save(user);
    }
}
