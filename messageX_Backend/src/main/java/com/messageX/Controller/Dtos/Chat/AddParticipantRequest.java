package com.messageX.Controller.Dtos.Chat;

import lombok.Data;

import java.util.UUID;

@Data
public class AddParticipantRequest {
    private UUID chatRoomId;
    private UUID userId;
}
