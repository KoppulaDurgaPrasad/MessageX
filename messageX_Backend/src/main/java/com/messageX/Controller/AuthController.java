package com.messageX.Controller;

import com.messageX.Controller.Dtos.Auth.*;
import com.messageX.Service.AuthService;
import com.messageX.Service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(
            @RequestBody SendOtpRequest request) {

        otpService.sendOtp(request.getPhoneNumber());
        return ResponseEntity.ok("OTP Sent Successfully.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        boolean verified = otpService.verifyOtp(
                request.getPhoneNumber(),
                request.getOtp()
        );

        if (!verified) {
            return ResponseEntity.badRequest().build();
        }

        LoginResponse response =
                authService.login(request.getPhoneNumber());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refreshToken(
            @RequestBody RefreshTokenRequest request) {

        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @RequestBody LogoutRequest request) {

        authService.logout(request.getRefreshToken());

        return ResponseEntity.ok("Logout Successful");
    }
}