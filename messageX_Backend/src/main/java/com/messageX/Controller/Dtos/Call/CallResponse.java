package com.messageX.Controller.Dtos.Call;

import com.messageX.Entity.Enum.CallStatus;
import com.messageX.Entity.Enum.CallType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CallResponse {

    private UUID callId;

    private UUID chatRoomId;

    private UUID initiatorId;

    private UUID participantId;

    private String participantName;

    private String participantProfilePicture;

    private CallType type;

    private CallStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    private Long durationSeconds;
}