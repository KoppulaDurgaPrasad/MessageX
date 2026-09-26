package com.messageX.Repository;

import com.messageX.Entity.ChatRoom;
import com.messageX.Entity.Enum.ChatType;
import com.messageX.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    List<ChatRoom> findByChatType(ChatType chatType);

    @Query("""
            SELECT c
            FROM ChatRoom c
            JOIN ChatParticipant p1 ON p1.chatRoom = c
            JOIN ChatParticipant p2 ON p2.chatRoom = c
            WHERE c.chatType='PRIVATE'
            AND p1.user=:user1
            AND p2.user=:user2
            """)
    Optional<ChatRoom> findPrivateChat(User user1, User user2);

}