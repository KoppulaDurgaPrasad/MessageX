package com.messageX.Service;

import com.messageX.Controller.Dtos.Auth.LoginResponse;
import com.messageX.Controller.Dtos.Auth.RefreshTokenRequest;
import com.messageX.Controller.Dtos.Auth.RefreshTokenResponse;

public interface AuthService {

    LoginResponse login(String phoneNumber);

    RefreshTokenResponse refreshToken(RefreshTokenRequest request);

    void logout(String refreshToken);

}