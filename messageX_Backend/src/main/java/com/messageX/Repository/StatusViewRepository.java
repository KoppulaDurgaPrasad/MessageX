package com.messageX.Repository;

import com.messageX.Entity.Status;
import com.messageX.Entity.StatusView;
import com.messageX.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StatusViewRepository extends JpaRepository<StatusView, UUID> {

    @Query("""
            SELECT sv
            FROM StatusView sv
            JOIN FETCH sv.viewer
            WHERE sv.status = :status
            ORDER BY sv.viewedAt DESC
            """)
    List<StatusView> findByStatusWithViewer(
            @Param("status") Status status
    );

    List<StatusView> findByStatus(Status status);

    List<StatusView> findByViewer(User viewer);

    Optional<StatusView> findByStatusAndViewer(
            Status status,
            User viewer
    );

    boolean existsByStatusAndViewer(
            Status status,
            User viewer
    );
}