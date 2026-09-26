package com.messageX.Service;

public interface OtpService {

    void sendOtp(String phoneNumber);

    boolean verifyOtp(String phoneNumber, String otp);

}
