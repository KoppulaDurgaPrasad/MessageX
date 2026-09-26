package com.messageX.Controller.Dtos.Call;

import com.messageX.Entity.Enum.CallType;
import lombok.Data;

import java.util.UUID;

@Data
public class StartCallRequest {

    private UUID chatRoomId;

    private CallType type;

}