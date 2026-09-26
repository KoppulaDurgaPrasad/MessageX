package com.messageX.Controller.Dtos.Auth;

import lombok.Data;

@Data
public class VerifyOtpRequest {

    private String phoneNumber;

    private String otp;

}