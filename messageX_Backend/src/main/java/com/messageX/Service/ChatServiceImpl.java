package com.messageX.Service;

import com.messageX.Controller.Dtos.Chat.*;
import com.messageX.Controller.Dtos.Message.MessageResponse;
import com.messageX.Controller.Dtos.Message.SendMessageRequest;
import com.messageX.Entity.ChatParticipant;
import com.messageX.Entity.ChatRoom;
import com.messageX.Entity.Enum.ChatType;
import com.messageX.Entity.Enum.MessageType;
import com.messageX.Entity.Message;
import com.messageX.Entity.User;
import com.messageX.Repository.ChatParticipantRepository;
import com.messageX.Repository.ChatRoomRepository;
import com.messageX.Repository.MessageRepository;
import com.messageX.Repository.UserRepository;
import lombok.RequiredArgsConstructor;


import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final MessageService messageService;

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

    private ChatRoomResponse mapToChatRoomResponse(ChatRoom chatRoom) {

        User currentUser = getLoggedInUser();

        Message lastMessage = messageRepository
                .findTopByChatRoomOrderBySentAtDesc(chatRoom)
                .orElse(null);

        int participantCount =
                (int) chatParticipantRepository.countByChatRoom(chatRoom);

        String name = chatRoom.getName();
        String image = chatRoom.getImage();

        if (chatRoom.getChatType() == ChatType.PRIVATE) {

            ChatParticipant otherParticipant =
                    chatParticipantRepository.findByChatRoom(chatRoom)
                            .stream()
                            .filter(participant ->
                                    !participant.getUser().getId()
                                            .equals(currentUser.getId()))
                            .findFirst()
                            .orElseThrow(() ->
                                    new RuntimeException("Participant not found"));

            name = otherParticipant.getUser().getUsername();
            image = otherParticipant.getUser().getProfilePicture();
        }

        return new ChatRoomResponse(

                chatRoom.getId(),

                name,

                image,

                chatRoom.getDescription(),

                chatRoom.getChatType(),

                lastMessage != null
                        ? lastMessage.getContent()
                        : null,

                lastMessage != null
                        ? lastMessage.getSentAt()
                        : chatRoom.getCreatedAt(),

                participantCount
        );
    }

    private ChatParticipantResponse mapToParticipantResponse(
            ChatParticipant participant) {

        return new ChatParticipantResponse(

                participant.getUser().getId(),

                participant.getUser().getUsername(),

                participant.getUser().getProfilePicture(),

                participant.getAdmin(),

                participant.getMuted(),

                participant.getJoinedAt()
        );
    }

    @Override
    @Transactional
    @CacheEvict(value = "myChats", allEntries = true)
    public ChatRoomResponse createPrivateChat(CreatePrivateChatRequest request) {

        User sender = getLoggedInUser();

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("You cannot create a chat with yourself.");
        }

        ChatRoom existingChat = chatRoomRepository
                .findPrivateChat(sender, receiver)
                .orElse(null);

        if (existingChat != null) {
            return mapToChatRoomResponse(existingChat);
        }

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setChatType(ChatType.PRIVATE);
        chatRoom.setCreatedBy(sender);
        chatRoom.setName(null);
        chatRoom.setImage(null);
        chatRoom.setDescription(null);

        chatRoom = chatRoomRepository.save(chatRoom);

        ChatParticipant senderParticipant = new ChatParticipant();
        senderParticipant.setChatRoom(chatRoom);
        senderParticipant.setUser(sender);
        senderParticipant.setAdmin(false);

        ChatParticipant receiverParticipant = new ChatParticipant();
        receiverParticipant.setChatRoom(chatRoom);
        receiverParticipant.setUser(receiver);
        receiverParticipant.setAdmin(false);

        chatParticipantRepository.save(senderParticipant);
        chatParticipantRepository.save(receiverParticipant);

        return mapToChatRoomResponse(chatRoom);
    }

    @Override
    @CacheEvict(value = "myChats", allEntries = true)
    public ChatRoomResponse createGroup(CreateGroupRequest request) {

        User creator = getLoggedInUser();

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Group name is required.");
        }

        if (request.getMemberIds() == null || request.getMemberIds().isEmpty()) {
            throw new RuntimeException("Select at least one member.");
        }

        ChatRoom chatRoom = new ChatRoom();



        chatRoom.setName(request.getName());
        chatRoom.setImage(request.getImage());
        chatRoom.setDescription(request.getDescription());
        chatRoom.setChatType(ChatType.GROUP);
        chatRoom.setCreatedBy(creator);

        chatRoom = chatRoomRepository.save(chatRoom);

        ChatParticipant creatorParticipant = new ChatParticipant();
        creatorParticipant.setChatRoom(chatRoom);
        creatorParticipant.setUser(creator);
        creatorParticipant.setAdmin(true);

        chatParticipantRepository.save(creatorParticipant);
        for (UUID memberId : request.getMemberIds().stream().distinct().toList())  {

            if (memberId.equals(creator.getId())) {
                continue;
            }

            User member = userRepository.findById(memberId)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            if (!chatParticipantRepository.existsByChatRoomAndUser(chatRoom, member)) {

                ChatParticipant participant = new ChatParticipant();
                participant.setChatRoom(chatRoom);
                participant.setUser(member);
                participant.setAdmin(false);

                chatParticipantRepository.save(participant);
            }
        }

        return mapToChatRoomResponse(chatRoom);
    }

    @Override
    @Transactional
    public List<ChatRoomResponse> getMyChats() {

        User currentUser = getLoggedInUser();

        List<ChatParticipant> participants =
                chatParticipantRepository.findByUser(currentUser);

        return participants.stream()
                .filter(participant -> !Boolean.TRUE.equals(participant.getLeftGroup()))
                .map(ChatParticipant::getChatRoom)
                .sorted((c1, c2) ->
                        c2.getLastMessageAt().compareTo(c1.getLastMessageAt()))
                .map(this::mapToChatRoomResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "chatParticipants", key = "#chatRoomId")
    public List<ChatParticipantResponse> getParticipants(UUID chatRoomId) {

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() ->
                        new RuntimeException("Chat room not found"));

        List<ChatParticipant> participants =
                chatParticipantRepository.findByChatRoomWithUser(chatRoom);

        return participants.stream()
                .filter(participant -> !Boolean.TRUE.equals(participant.getLeftGroup()))
                .map(this::mapToParticipantResponse)
                .toList();
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "myChats", allEntries = true),
            @CacheEvict(value = "chatParticipants", key = "#request.chatRoomId")
    })
    public ChatRoomResponse updateGroup(UpdateGroupRequest request) {

        User currentUser = getLoggedInUser();

        ChatRoom chatRoom = chatRoomRepository.findById(request.getChatRoomId())
                .orElseThrow(() ->
                        new RuntimeException("Chat room not found"));

        if (chatRoom.getChatType() != ChatType.GROUP) {
            throw new RuntimeException("Only groups can be updated.");
        }

        ChatParticipant participant = chatParticipantRepository
                .findByChatRoomAndUser(chatRoom, currentUser)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this group."));

        if (!participant.getAdmin()) {
            throw new RuntimeException("Only admins can update the group.");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            chatRoom.setName(request.getName().trim());
        }

        if (request.getImage() != null) {
            chatRoom.setImage(request.getImage());
        }

        if (request.getDescription() != null &&
                !request.getDescription().isBlank()) {

            chatRoom.setDescription(request.getDescription().trim());
        }

        chatRoom = chatRoomRepository.save(chatRoom);

        return mapToChatRoomResponse(chatRoom);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "myChats", allEntries = true),
            @CacheEvict(value = "chatParticipants", key = "#request.chatRoomId")
    })
    public void addParticipant(AddParticipantRequest request) {

        User currentUser = getLoggedInUser();

        ChatRoom chatRoom = chatRoomRepository.findById(request.getChatRoomId())
                .orElseThrow(() ->
                        new RuntimeException("Chat room not found"));

        if (chatRoom.getChatType() != ChatType.GROUP) {
            throw new RuntimeException("Members can only be added to group chats.");
        }

        ChatParticipant admin = chatParticipantRepository
                .findByChatRoomAndUser(chatRoom, currentUser)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this group."));

        if (!admin.getAdmin()) {
            throw new RuntimeException("Only group admins can add members.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (chatParticipantRepository.existsByChatRoomAndUser(chatRoom, user)) {
            throw new RuntimeException("User is already a member.");
        }

        ChatParticipant participant = new ChatParticipant();
        participant.setChatRoom(chatRoom);
        participant.setUser(user);
        participant.setAdmin(false);

        chatParticipantRepository.save(participant);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "myChats", allEntries = true),
            @CacheEvict(value = "chatParticipants", key = "#request.chatRoomId")
    })
    public void removeParticipant(RemoveParticipantRequest request) {

        User currentUser = getLoggedInUser();

        ChatRoom chatRoom = chatRoomRepository.findById(request.getChatRoomId())
                .orElseThrow(() ->
                        new RuntimeException("Chat room not found"));

        if (chatRoom.getChatType() != ChatType.GROUP) {
            throw new RuntimeException("Members can only be removed from group chats.");
        }

        ChatParticipant admin = chatParticipantRepository
                .findByChatRoomAndUser(chatRoom, currentUser)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this group."));

        if (!admin.getAdmin()) {
            throw new RuntimeException("Only group admins can remove members.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        ChatParticipant participant = chatParticipantRepository
                .findByChatRoomAndUser(chatRoom, user)
                .orElseThrow(() ->
                        new RuntimeException("User is not a group member."));

        if (user.getId().equals(chatRoom.getCreatedBy().getId())) {
            throw new RuntimeException("Group creator cannot be removed.");
        }

        SendMessageRequest systemMessage = new SendMessageRequest();

        systemMessage.setChatRoomId(chatRoom.getId());
        systemMessage.setContent(
                user.getUsername() + " was removed from the group"
        );
        systemMessage.setType(MessageType.TEXT);

        messageService.sendMessage(systemMessage, currentUser);
        chatParticipantRepository.delete(participant);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "myChats", allEntries = true),
            @CacheEvict(value = "chatParticipants", key = "#chatRoomId")
    })
    public MessageResponse leaveChat(UUID chatRoomId) {

        User currentUser = getLoggedInUser();

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found."));

        ChatParticipant participant = chatParticipantRepository
                .findByChatRoomAndUser(chatRoom, currentUser)
                .orElseThrow(() -> new RuntimeException("You are not a participant."));

        SendMessageRequest systemMessage = new SendMessageRequest();
        systemMessage.setChatRoomId(chatRoom.getId());
        systemMessage.setContent(currentUser.getUsername() + " left the group");
        systemMessage.setType(MessageType.TEXT);

        MessageResponse response =
                messageService.sendMessage(systemMessage, currentUser);

        participant.setLeftGroup(true);
        participant.setLeftAt(LocalDateTime.now());

        chatParticipantRepository.save(participant);

        return response;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "myChats", allEntries = true),
            @CacheEvict(value = "chatParticipants", key = "#chatRoomId")
    })
    public void deleteGroup(UUID chatRoomId) {

        User currentUser = getLoggedInUser();

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() ->
                        new RuntimeException("Chat room not found"));

        if (chatRoom.getChatType() != ChatType.GROUP) {
            throw new RuntimeException("Only groups can be deleted.");
        }

        ChatParticipant participant =
                chatParticipantRepository
                        .findByChatRoomAndUser(chatRoom, currentUser)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "You are not a member of this group."
                                ));

        if (!participant.getAdmin()) {
            throw new RuntimeException(
                    "Only group admins can delete the group."
            );
        }

        chatRoomRepository.delete(chatRoom);
    }

}


