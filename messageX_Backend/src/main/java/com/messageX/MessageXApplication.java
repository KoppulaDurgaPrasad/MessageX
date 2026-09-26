package com.messageX;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MessageXApplication {

	public static void main(String[] args) {
		SpringApplication.run(MessageXApplication.class, args);
	}
}