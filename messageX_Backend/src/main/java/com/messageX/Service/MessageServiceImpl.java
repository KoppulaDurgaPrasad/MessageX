package com.messageX.Service;


import com.messageX.Controller.Dtos.Message.*;
import com.messageX.Entity.*;
import com.messageX.Entity.Enum.ChatType;
import com.messageX.Entity.Enum.MessageStatus;
import com.messageX.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final UserRepository userRepository;
    private final DeletedMessageRepository deletedMessageRepository;

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }

        User currentUser = (User) authentication.getPrincipal();

        return userRepository.findById(currentUser.getId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private MessageResponse mapToMessageResponse(Message message) {

        return new MessageResponse(

                message.getId(),

                message.getSender().getId(),

                message.getSender().getUsername(),

                message.getSender().getProfilePicture(),

                message.getChatRoom().getId(),

                message.getContent(),

                message.getMediaUrl(),

                message.getFileName(),

                message.getType(),

                message.getStatus(),

                message.getEdited(),

                message.getDeletedForEveryone(),

                message.getSentAt(),

                message.getDeliveredAt(),

                message.getSeenAt()
        );
    }

    private MessageStatusResponse mapToMessageStatusResponse(Message message) {

        return new MessageStatusResponse(

                message.getId(),

                message.getStatus(),

                message.getDeliveredAt(),

                message.getSeenAt()
        );
    }

    @Override
    @Transactional
    public List<MessageResponse> getMessages(UUID chatRoomId) {

        User currentUser = getLoggedInUser();

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() ->
                        new RuntimeException("Chat room not found."));

        ChatParticipant participant = chatParticipantRepository
                .findByChatRoomAndUser(chatRoom, currentUser)
                .orElseThrow(() ->
                        new RuntimeException("You are not a participant of this chat."));

        if (Boolean.TRUE.equals(participant.getLeftGroup())) {
            throw new RuntimeException("You have left this chat.");
        }

        List<Message> messages =
                messageRepository.findByChatRoomOrderBySentAtAsc(chatRoom);

        return messages.stream()
                .filter(message ->
                        !deletedMessageRepository.existsByMessageAndUser(
                                message,
                                currentUser
                        ))
                .map(this::mapToMessageResponse)
                .toList();
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(
            SendMessageRequest request) {

        User sender = getLoggedInUser();

        return sendMessage(request, sender);
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, User sender) {

        ChatRoom chatRoom = chatRoomRepository.findById(request.getChatRoomId())
                .orElseThrow(() ->
                        new RuntimeException("Chat room not found."));

        ChatParticipant participant = chatParticipantRepository
                .findByChatRoomAndUser(chatRoom, sender)
                .orElseThrow(() ->
                        new RuntimeException("You are not a participant of this chat."));

        if (Boolean.TRUE.equals(participant.getLeftGroup())) {
            throw new RuntimeException("You have left this chat.");
        }

        if ((request.getContent() == null || request.getContent().isBlank())
                && request.getMediaUrl() == null) {
            throw new RuntimeException("Message cannot be empty.");
        }
        if (request.getType() == null) {
            throw new RuntimeException("Message type is required.");
        }
        Message message = new Message();

        message.setSender(sender);
        message.setChatRoom(chatRoom);
        message.setContent(
                request.getContent() != null
                        ? request.getContent().trim()
                        : null
        );
        message.setMediaUrl(request.getMediaUrl());
        message.setFileName(request.getFileName());
        message.setType(request.getType());

        message = messageRepository.save(message);

        chatRoom.setLastMessageAt(message.getSentAt());
        chatRoomRepository.save(chatRoom);

        return mapToMessageResponse(message);
    }

    @Override
    @Transactional
    public MessageResponse editMessage(EditMessageRequest request) {

        User currentUser = getLoggedInUser();

        return editMessage(request, currentUser);
    }


    @Override
    @Transactional
    public MessageResponse editMessage(
            EditMessageRequest request,
            User editor
    ) {

        Message message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() ->
                        new RuntimeException("Message not found.")
                );

        if (!message.getSender().getId().equals(editor.getId())) {
            throw new RuntimeException(
                    "You can edit only your own messages."
            );
        }

        if (Boolean.TRUE.equals(message.getDeletedForEveryone())) {
            throw new RuntimeException(
                    "Message has been deleted."
            );
        }

        if (request.getContent() == null ||
                request.getContent().isBlank()) {

            throw new RuntimeException(
                    "Message cannot be empty."
            );
        }

        message.setContent(request.getContent().trim());
        message.setEdited(true);
        message.setEditedAt(LocalDateTime.now());

        message = messageRepository.save(message);

        return mapToMessageResponse(message);
    }


    @Override
    @Transactional
    public void deleteForMe(DeleteMessageRequest request) {

        User currentUser = getLoggedInUser();

        deleteForMe(request, currentUser);
    }


    @Override
    @Transactional
    public void deleteForMe(
            DeleteMessageRequest request,
            User user
    ) {

        Message message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() ->
                        new RuntimeException("Message not found.")
                );

        if (deletedMessageRepository.existsByMessageAndUser(message, user)) {
            throw new RuntimeException("Message already deleted.");
        }

        DeletedMessage deletedMessage = new DeletedMessage();

        deletedMessage.setMessage(message);
        deletedMessage.setUser(user);

        deletedMessageRepository.save(deletedMessage);
    }


    @Override
    @Transactional
    public MessageResponse deleteForEveryone(
            DeleteMessageRequest request
    ) {

        User currentUser = getLoggedInUser();

        return deleteForEveryone(request, currentUser);
    }


    @Override
    @Transactional
    public MessageResponse deleteForEveryone(
            DeleteMessageRequest request,
            User currentUser
    ) {

        Message message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() ->
                        new RuntimeException("Message not found.")
                );

        if (Boolean.TRUE.equals(message.getDeletedForEveryone())) {
            throw new RuntimeException("Message is already deleted.");
        }

        ChatRoom chatRoom = message.getChatRoom();


        boolean isSender =
                message.getSender().getId().equals(currentUser.getId());

        boolean isAdmin = false;

        if (chatRoom.getChatType() == ChatType.GROUP) {

            ChatParticipant participant =
                    chatParticipantRepository
                            .findByChatRoomAndUser(chatRoom, currentUser)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "You are not a participant of this group."
                                    )
                            );

            if (Boolean.TRUE.equals(participant.getLeftGroup())) {
                throw new RuntimeException(
                        "You have left this group."
                );
            }

            isAdmin = Boolean.TRUE.equals(participant.getAdmin());
        }

        if (!isSender && !isAdmin) {
            throw new RuntimeException(
                    "You are not authorized to delete this message."
            );
        }

        message.setDeletedForEveryone(true);
        message.setContent("This message was deleted.");
        message.setMediaUrl(null);
        message.setFileName(null);
        message.setEdited(false);
        message.setEditedAt(null);

        message = messageRepository.save(message);

        return mapToMessageResponse(message);
    }



    @Override
    public MessageStatusResponse markDelivered(UpdateMessageStatusRequest request) {



        Message message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() ->
                        new RuntimeException("Message not found."));

        User currentUser = getLoggedInUser();

        chatParticipantRepository
                .findByChatRoomAndUser(message.getChatRoom(), currentUser)
                .orElseThrow(() ->
                        new RuntimeException("You are not a participant of this chat."));

        if (message.getStatus() == MessageStatus.SENT) {

            message.setStatus(MessageStatus.DELIVERED);
            message.setDeliveredAt(LocalDateTime.now());

            message = messageRepository.save(message);
        }



        return mapToMessageStatusResponse(message);
    }

    @Override
    public MessageStatusResponse markSeen(UpdateMessageStatusRequest request) {

        Message message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() ->
                        new RuntimeException("Message not found."));

        User currentUser = getLoggedInUser();

        chatParticipantRepository
                .findByChatRoomAndUser(message.getChatRoom(), currentUser)
                .orElseThrow(() ->
                        new RuntimeException("You are not a participant of this chat."));

        if (message.getStatus() != MessageStatus.SEEN) {

            if (message.getStatus() == MessageStatus.SENT) {
                message.setStatus(MessageStatus.DELIVERED);
                message.setDeliveredAt(LocalDateTime.now());
            }

            message.setStatus(MessageStatus.SEEN);
            message.setSeenAt(LocalDateTime.now());

            message = messageRepository.save(message);
        }

        return mapToMessageStatusResponse(message);
    }

}





