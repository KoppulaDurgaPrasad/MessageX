package com.messageX.Repository;

import com.messageX.Entity.ChatRoom;
import com.messageX.Entity.Enum.MessageStatus;
import com.messageX.Entity.Message;

import com.messageX.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {


    List<Message> findByChatRoomOrderBySentAtAsc(ChatRoom chatRoom);

    Optional<Message> findTopByChatRoomOrderBySentAtDesc(ChatRoom chatRoom);

    List<Message> findBySender(User sender);

    List<Message> findByStatus(MessageStatus status);

}