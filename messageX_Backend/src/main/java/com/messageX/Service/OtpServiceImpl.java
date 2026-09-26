package com.messageX.Service;

import com.messageX.Config.TwilioConfig;
import com.messageX.Entity.OtpData;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final TwilioConfig twilioConfig;

    @Value("${otp.expiry}")
    private long otpExpirySeconds;

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    @Override
    public void sendOtp(String phoneNumber) {

        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));

        otpStorage.put(
                phoneNumber,
                new OtpData(
                        otp,
                        LocalDateTime.now().plusSeconds(otpExpirySeconds)
                )
        );

        Message.creator(
                new PhoneNumber(phoneNumber),
                new PhoneNumber(twilioConfig.getPhoneNumber()),
                "Your MessageX OTP is: " + otp +
                        "\nIt is valid for 5 minutes."
        ).create();
    }

    @Override
    public boolean verifyOtp(String phoneNumber, String otp) {

        OtpData otpData = otpStorage.get(phoneNumber);

        if (otpData == null) {
            return false;
        }

        if (otpData.getExpiry().isBefore(LocalDateTime.now())) {
            otpStorage.remove(phoneNumber);
            return false;
        }

        if (!otpData.getOtp().equals(otp)) {
            return false;
        }

        otpStorage.remove(phoneNumber);

        return true;
    }
}