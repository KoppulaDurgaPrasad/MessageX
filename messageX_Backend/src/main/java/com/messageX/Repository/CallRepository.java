package com.messageX.Repository;

import com.messageX.Entity.Call;
import com.messageX.Entity.ChatRoom;
import com.messageX.Entity.Enum.CallStatus;
import com.messageX.Entity.Enum.CallType;
import com.messageX.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CallRepository extends JpaRepository<Call, UUID> {

    List<Call> findByInitiator(User initiator);

    List<Call> findByChatRoom(ChatRoom chatRoom);

    Optional<Call> findTopByChatRoomOrderByStartedAtDesc(ChatRoom chatRoom);

    List<Call> findByStatus(CallStatus status);

    List<Call> findByType(CallType type);

    Optional<Call> findByChatRoomAndStatus(ChatRoom chatRoom, CallStatus status);

    Optional<Call> findByChatRoomAndStatusIn(
            ChatRoom chatRoom,
            List<CallStatus> statuses
    );

    @Query("""
    SELECT c FROM Call c
    WHERE c.initiator = :user
       OR c.receiver = :user
""")
    List<Call> findMyCalls(@Param("user") User user);
}