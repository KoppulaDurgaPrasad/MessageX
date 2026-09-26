package com.messageX.Service;


import com.messageX.Controller.Dtos.Message.*;
import com.messageX.Entity.User;

import java.util.List;
import java.util.UUID;

public interface MessageService {

    MessageResponse sendMessage(SendMessageRequest request);

    MessageResponse sendMessage(
            SendMessageRequest request,
            User sender
    );

    List<MessageResponse> getMessages(UUID chatRoomId);

    MessageResponse editMessage(EditMessageRequest request);

    MessageResponse editMessage(
            EditMessageRequest request,
            User editor
    );

    void deleteForMe(DeleteMessageRequest request);

    void deleteForMe(
            DeleteMessageRequest request,
            User user
    );

    MessageResponse deleteForEveryone(DeleteMessageRequest request);

    MessageResponse deleteForEveryone(
            DeleteMessageRequest request,
            User user
    );

    MessageStatusResponse markDelivered(UpdateMessageStatusRequest request);

    MessageStatusResponse markSeen(UpdateMessageStatusRequest request);
}