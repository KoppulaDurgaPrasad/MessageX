package com.messageX.Entity;

import com.messageX.Entity.Enum.MessageStatus;
import com.messageX.Entity.Enum.MessageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "messages",
        indexes = {
                @Index(name = "idx_chat_room", columnList = "chat_room_id"),
                @Index(name = "idx_sender", columnList = "sender_id")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageStatus status;

    private String mediaUrl;

    private String fileName;

    private Boolean edited;

    private LocalDateTime editedAt;

    private Boolean deletedForEveryone;

    private LocalDateTime sentAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime seenAt;

    @PrePersist
    public void prePersist() {

        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }

        if (edited == null) {
            edited = false;
        }

        if (deletedForEveryone == null) {
            deletedForEveryone = false;
        }

        if (status == null) {
            status = MessageStatus.SENT;
        }
    }
}