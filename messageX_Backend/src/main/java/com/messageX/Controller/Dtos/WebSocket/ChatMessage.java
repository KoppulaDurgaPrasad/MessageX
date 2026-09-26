package com.messageX.Controller.Dtos.WebSocket;

import com.messageX.Entity.Enum.MessageType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ChatMessage {

    private UUID chatRoomId;

    private String content;

    private String mediaUrl;

    private String fileName;

    private MessageType type;

}