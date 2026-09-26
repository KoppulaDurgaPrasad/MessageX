package com.messageX.Controller.Dtos.Message;

import com.messageX.Entity.Enum.MessageStatus;
import com.messageX.Entity.Enum.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class MessageResponse {

    private UUID messageId;

    private UUID senderId;

    private String senderName;

    private String senderProfilePicture;

    private UUID chatRoomId;

    private String content;

    private String mediaUrl;

    private String fileName;

    private MessageType type;

    private MessageStatus status;

    private Boolean edited;

    private Boolean deletedForEveryone;

    private LocalDateTime sentAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime seenAt;

}