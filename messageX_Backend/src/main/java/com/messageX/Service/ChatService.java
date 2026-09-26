package com.messageX.Service;

import com.messageX.Controller.Dtos.Chat.*;
import com.messageX.Controller.Dtos.Message.MessageResponse;

import java.util.List;
import java.util.UUID;

public interface ChatService {

    ChatRoomResponse createPrivateChat(CreatePrivateChatRequest request);

    ChatRoomResponse createGroup(CreateGroupRequest request);

    List<ChatRoomResponse> getMyChats();

    List<ChatParticipantResponse> getParticipants(UUID chatRoomId);

    ChatRoomResponse updateGroup(UpdateGroupRequest request);

    void addParticipant(AddParticipantRequest request);

    void removeParticipant(RemoveParticipantRequest request);

    MessageResponse leaveChat(UUID chatRoomId);

    void deleteGroup(UUID chatRoomId);

}
