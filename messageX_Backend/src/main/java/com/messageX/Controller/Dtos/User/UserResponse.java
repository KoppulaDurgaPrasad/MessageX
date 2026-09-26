package com.messageX.Controller.Dtos.User;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserResponse {

    private UUID id;

    private String username;

    private String phoneNumber;

    private String profilePicture;

    private String about;

    private Boolean online;

    private Boolean verified;

    private Boolean profileCompleted;

    private LocalDateTime lastSeen;

}