package com.messageX.Repository;

import com.messageX.Entity.Status;
import com.messageX.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StatusRepository extends JpaRepository<Status, UUID> {

    List<Status> findByUser(User user);

    List<Status> findByCreatedAtAfter(LocalDateTime time);

    List<Status> findByExpiresAtBefore(LocalDateTime time);

    @Query("""
            SELECT s
            FROM Status s
            JOIN FETCH s.user
            WHERE s.user = :user
            ORDER BY s.createdAt DESC
            """)
    List<Status> findByUserWithUserOrderByCreatedAtDesc(
            @Param("user") User user
    );

    @Query("""
            SELECT s
            FROM Status s
            JOIN FETCH s.user
            WHERE s.expiresAt > :time
            ORDER BY s.createdAt DESC
            """)
    List<Status> findActiveStatusesWithUser(
            @Param("time") LocalDateTime time
    );

    @Query("""
        SELECT s
        FROM Status s
        JOIN FETCH s.user
        WHERE s.id = :statusId
        """)
    Optional<Status> findByIdWithUser(
            @Param("statusId") UUID statusId
    );
}