package com.messageX.Controller.Dtos.WebSocket;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserStatusMessage {

    private UUID userId;

    private boolean online;

    private LocalDateTime lastSeen;
}