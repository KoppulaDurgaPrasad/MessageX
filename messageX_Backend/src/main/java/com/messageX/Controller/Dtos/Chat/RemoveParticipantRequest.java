package com.messageX.Controller.Dtos.Chat;

import lombok.Data;

import java.util.UUID;

@Data
public class RemoveParticipantRequest {

    private UUID chatRoomId;

    private UUID userId;
}
