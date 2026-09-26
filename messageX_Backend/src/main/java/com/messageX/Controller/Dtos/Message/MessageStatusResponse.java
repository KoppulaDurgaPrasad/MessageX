package com.messageX.Controller.Dtos.Message;

import com.messageX.Entity.Enum.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class MessageStatusResponse {

    private UUID messageId;

    private MessageStatus status;

    private LocalDateTime deliveredAt;

    private LocalDateTime seenAt;

}