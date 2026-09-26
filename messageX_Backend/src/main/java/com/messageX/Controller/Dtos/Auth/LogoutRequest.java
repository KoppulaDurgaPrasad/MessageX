package com.messageX.Controller.Dtos.Auth;

import lombok.Data;

@Data
public class LogoutRequest {

    private String refreshToken;

}
