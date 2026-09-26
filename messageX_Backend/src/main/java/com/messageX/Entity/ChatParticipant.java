package com.messageX.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Boolean admin;

    private LocalDateTime joinedAt;

    private Boolean muted;

    private Boolean leftGroup;

    private LocalDateTime leftAt;

    @PrePersist
    public void prePersist() {

        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }

        if (admin == null) {
            admin = false;
        }

        if (muted == null) {
            muted = false;
        }

        if (leftGroup == null) {
            leftGroup = false;
        }
    }
}