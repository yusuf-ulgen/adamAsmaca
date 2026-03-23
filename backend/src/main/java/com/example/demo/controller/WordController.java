package com.example.demo.controller;

import com.example.demo.model.WordResponse;
import com.example.demo.service.WordService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // For development
public class WordController {

    private final WordService wordService;

    public WordController(WordService wordService) {
        this.wordService = wordService;
    }

    @GetMapping("/word")
    public WordResponse getWord(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String category) {
        return wordService.getRandomWord(difficulty, category);
    }
}
