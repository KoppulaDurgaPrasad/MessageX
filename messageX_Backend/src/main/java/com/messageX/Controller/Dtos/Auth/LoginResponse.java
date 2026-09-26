package com.messageX.Controller.Dtos.Auth;

import com.messageX.Controller.Dtos.User.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;

    private String refreshToken;

    private UserResponse user;

}
