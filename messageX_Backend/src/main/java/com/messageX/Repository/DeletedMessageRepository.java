package com.messageX.Repository;

import com.messageX.Entity.DeletedMessage;
import com.messageX.Entity.Message;
import com.messageX.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DeletedMessageRepository extends JpaRepository<DeletedMessage, UUID> {

    boolean existsByMessageAndUser(Message message, User user);

}