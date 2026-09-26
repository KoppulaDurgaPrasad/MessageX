package com.messageX.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;


    @Column(length = 50)
    private String username;

    @Column(unique = true)
    private String phoneNumber;

    private String profilePicture;

    private Boolean online = false;


    private Boolean verified = false;


    private Boolean profileCompleted = false;

    @Column(length = 150)
    private String about;

    @Column(length = 500)
    private String refreshToken;

    private LocalDateTime refreshTokenExpiry;

    private LocalDateTime lastSeen;


    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "sender", fetch = FetchType.LAZY)
    private List<Message> sentMessages;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<ChatParticipant> chatParticipants;

   @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Status> statuses;

    @OneToMany(mappedBy = "viewer", fetch = FetchType.LAZY)
    private List<StatusView> viewedStatuses;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<CallParticipant> callParticipants;

    @OneToMany(mappedBy = "initiator", fetch = FetchType.LAZY)
    private List<Call> initiatedCalls;

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }

        if (lastSeen == null) {
            lastSeen = LocalDateTime.now();
        }

        if (online == null) {
            online = false;
        }

        if (verified == null) {
            verified = false;
        }

        if (profileCompleted == null) {
            profileCompleted = false;
        }
    }
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}