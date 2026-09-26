package com.messageX.Controller.Dtos.Message;

import lombok.Data;

import java.util.UUID;

@Data
public class EditMessageRequest {

    private UUID messageId;

    private UUID chatRoomId;

    private String content;

}