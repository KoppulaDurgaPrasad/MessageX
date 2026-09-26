package com.messageX.Service;

import com.messageX.Config.JwtUtil;

import com.messageX.Controller.Dtos.Auth.LoginResponse;
import com.messageX.Controller.Dtos.Auth.RefreshTokenRequest;
import com.messageX.Controller.Dtos.Auth.RefreshTokenResponse;
import com.messageX.Entity.User;
import com.messageX.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.messageX.Controller.Dtos.User.UserResponse;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse login(String phoneNumber) {

        try {

            User user = userRepository.findByPhoneNumber(phoneNumber)
                    .orElseGet(() -> {

                        User newUser = new User();

                        newUser.setPhoneNumber(phoneNumber);
                        newUser.setUsername("User");
                        newUser.setVerified(true);
                        newUser.setOnline(true);
                        newUser.setProfileCompleted(false);
                        newUser.setProfilePicture(null);
                        newUser.setAbout(null);

                        return userRepository.save(newUser);
                    });

            user.setOnline(true);
            user.setVerified(true);
            user.setLastSeen(LocalDateTime.now());


            String accessToken =
                    jwtUtil.generateAccessToken(user.getId().toString());

            String refreshToken =
                    jwtUtil.generateRefreshToken(user.getId().toString());

            user.setRefreshToken(refreshToken);
            user.setRefreshTokenExpiry(
                    LocalDateTime.now().plusDays(15)
            );

            user = userRepository.save(user);

            UserResponse userResponse = new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getPhoneNumber(),
                    user.getProfilePicture(),
                    user.getAbout(),
                    user.getOnline(),
                    user.getVerified(),
                    user.getProfileCompleted(),
                    user.getLastSeen()
            );

            return new LoginResponse(
                    accessToken,
                    refreshToken,
                    userResponse
            );

        } catch (Exception e) {
            log.error("Login failed", e);
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {

        User user = userRepository
                .findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() ->
                        new RuntimeException("Invalid Refresh Token"));

        if (user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh Token Expired");
        }

        String accessToken =
                jwtUtil.generateAccessToken(user.getId().toString());

        return new RefreshTokenResponse(accessToken, user.getRefreshToken());
    }

    @Override
    public void logout(String refreshToken) {

        User user = userRepository
                .findByRefreshToken(refreshToken)
                .orElseThrow(() ->
                        new RuntimeException("Invalid Refresh Token"));

        user.setOnline(false);
        user.setLastSeen(LocalDateTime.now());
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);

        userRepository.save(user);
    }
}