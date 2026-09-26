package com.messageX.Controller.Dtos.Status;

import com.messageX.Entity.Enum.StatusType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class StatusResponse {

    private UUID statusId;

    private UUID userId;

    private String username;

    private String profilePicture;

    private String mediaUrl;

    private String caption;

    private StatusType type;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    private Boolean viewed;

}