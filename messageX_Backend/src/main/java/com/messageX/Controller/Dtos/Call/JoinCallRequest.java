package com.messageX.Controller.Dtos.Call;


import lombok.Data;

import java.util.UUID;

@Data
public class JoinCallRequest {
    private UUID callId;
}
