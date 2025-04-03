package com.steamtrends;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableScheduling 
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
