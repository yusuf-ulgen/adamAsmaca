package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PingController {

    @GetMapping("/ping")
    public String ping() {
        return "pong"; // UptimeRobot veya baska servisler buraya 14 dakikada bir "pong" cevabi alacak
    }
}
