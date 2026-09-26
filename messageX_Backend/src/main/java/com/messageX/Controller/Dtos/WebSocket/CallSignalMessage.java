package com.messageX.Controller.Dtos.WebSocket;

import com.messageX.Entity.Enum.CallType;
import lombok.Data;

import java.util.UUID;

@Data
public class CallSignalMessage {

    private UUID callId;

    private UUID chatRoomId;

    private UUID senderId;

    private UUID receiverId;

    private String action;

    private CallType callType;

    private String sdp;

    private String candidate;

    private String sdpMid;

    private Integer sdpMLineIndex;

    private String senderName;

    private String senderProfilePicture;
}