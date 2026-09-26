package com.messageX.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "status_views",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"status_id", "viewer_id"})
        },
        indexes = {
                @Index(name = "idx_status", columnList = "status_id"),
                @Index(name = "idx_viewer", columnList = "viewer_id")
        }
)
public class StatusView {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viewer_id")
    private User viewer;

    private LocalDateTime viewedAt;

    @PrePersist
    public void prePersist() {
        if (viewedAt == null) {
            viewedAt = LocalDateTime.now();
        }
    }
}
