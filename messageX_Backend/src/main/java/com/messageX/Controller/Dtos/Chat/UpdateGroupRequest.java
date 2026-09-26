package com.messageX.Controller.Dtos.Chat;

import lombok.Data;

import java.util.UUID;

@Data
public class UpdateGroupRequest {

    private UUID chatRoomId;

    private String name;

    private String image;

    private String description;

}