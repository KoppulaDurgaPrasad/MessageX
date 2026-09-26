package com.messageX.Controller.Dtos.User;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class SearchUserResponse {

    private UUID id;

    private String username;

    private String phoneNumber;

    private String profilePicture;

    private Boolean online;

}