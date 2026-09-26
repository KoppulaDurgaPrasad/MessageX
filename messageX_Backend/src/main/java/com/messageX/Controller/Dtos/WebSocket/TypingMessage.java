package com.messageX.Controller.Dtos.WebSocket;

import lombok.Data;

import java.util.UUID;

@Data
public class TypingMessage {

    private UUID chatRoomId;

    private UUID userId;

    private String username;

    private boolean typing;
}