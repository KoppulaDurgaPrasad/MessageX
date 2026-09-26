package com.messageX.Controller.Dtos.Message;

import lombok.Data;

import java.util.UUID;

@Data
public class UpdateMessageStatusRequest {

    private UUID messageId;
}
