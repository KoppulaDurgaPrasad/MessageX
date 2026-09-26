package com.messageX.Entity;

import com.messageX.Entity.Enum.CallStatus;
import com.messageX.Entity.Enum.CallType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "calls")
public class Call {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiator_id")
    private User initiator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @Enumerated(EnumType.STRING)
    private CallType type;

    @Enumerated(EnumType.STRING)
    private CallStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    @OneToMany(
            mappedBy = "call",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<CallParticipant> participants;

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = CallStatus.RINGING;
        }
    }
}
