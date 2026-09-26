package com.messageX.Controller.Dtos.Status;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class StatusViewResponse {

    private UUID viewerId;

    private String username;

    private String profilePicture;

    private LocalDateTime viewedAt;

}