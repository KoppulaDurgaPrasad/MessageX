package com.messageX.Controller.Dtos.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequest {

    private String name;

    private String image;

    private String description;

    private List<UUID> memberIds;

}
