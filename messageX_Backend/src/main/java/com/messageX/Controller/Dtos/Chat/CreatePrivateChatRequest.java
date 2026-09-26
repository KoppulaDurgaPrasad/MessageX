package com.messageX.Controller.Dtos.Chat;

import lombok.Data;

import java.util.UUID;

@Data
public class CreatePrivateChatRequest {
    private UUID receiverId;
}
