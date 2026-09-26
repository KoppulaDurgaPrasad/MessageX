package com.messageX.Config;

import com.messageX.Entity.User;
import com.messageX.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader =
                    accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null ||
                    !authHeader.startsWith("Bearer ")) {

                throw new RuntimeException(
                        "Missing JWT token."
                );
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isTokenValid(token)) {
                throw new RuntimeException(
                        "Invalid JWT token."
                );
            }

            String userId =
                    jwtUtil.extractSubject(token);

            User user =
                    userRepository.findById(
                            UUID.fromString(userId)
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "User not found."
                            )
                    );

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.emptyList()
                    ) {
                        @Override
                        public String getName() {
                            return user.getId().toString();
                        }
                    };
            accessor.setUser(authentication);

            System.out.println(
                    "WebSocket authenticated user: "
                            + user.getUsername()
            );
        }

        return message;
    }
}