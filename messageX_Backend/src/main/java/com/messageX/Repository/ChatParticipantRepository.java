package com.messageX.Repository;

import com.messageX.Entity.ChatParticipant;
import com.messageX.Entity.ChatRoom;
import com.messageX.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, UUID> {

    List<ChatParticipant> findByUser(User user);

    List<ChatParticipant> findByChatRoom(ChatRoom chatRoom);

    boolean existsByChatRoomAndUser(ChatRoom chatRoom, User user);

    Optional<ChatParticipant> findByChatRoomAndUser(ChatRoom chatRoom, User user);

    List<ChatParticipant> findByChatRoomAndAdminTrue(ChatRoom chatRoom);

    long countByChatRoom(ChatRoom chatRoom);

    @Query("""
    SELECT cp
    FROM ChatParticipant cp
    JOIN FETCH cp.user
    WHERE cp.chatRoom = :chatRoom
""")
    List<ChatParticipant> findByChatRoomWithUser(
            @Param("chatRoom") ChatRoom chatRoom
    );

}