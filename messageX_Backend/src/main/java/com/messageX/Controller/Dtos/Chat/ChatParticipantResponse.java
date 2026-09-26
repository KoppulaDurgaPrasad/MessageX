package com.messageX.Controller.Dtos.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class ChatParticipantResponse {

    private UUID userId;

    private String username;

    private String profilePicture;

    private Boolean admin;

    private Boolean muted;

    private LocalDateTime joinedAt;

}