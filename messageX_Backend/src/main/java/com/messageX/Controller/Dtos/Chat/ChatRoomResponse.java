package com.messageX.Controller.Dtos.Chat;

import com.messageX.Entity.Enum.ChatType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class ChatRoomResponse {

    private UUID chatRoomId;

    private String name;

    private String image;

    private String description;

    private ChatType chatType;

    private String lastMessage;

    private LocalDateTime lastMessageTime;

    private Integer participantCount;

}