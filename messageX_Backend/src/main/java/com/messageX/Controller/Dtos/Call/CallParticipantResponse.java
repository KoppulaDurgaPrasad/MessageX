package com.messageX.Controller.Dtos.Call;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class CallParticipantResponse {

    private UUID userId;

    private String username;

    private String profilePicture;

    private LocalDateTime joinedAt;

    private LocalDateTime leftAt;

}