package com.messageX.Controller.Dtos.Message;

import com.messageX.Entity.Enum.MessageType;
import lombok.Data;

import java.util.UUID;

@Data
public class SendMessageRequest {

    private UUID chatRoomId;

    private String content;

    private String mediaUrl;

    private String fileName;

    private MessageType type;

}