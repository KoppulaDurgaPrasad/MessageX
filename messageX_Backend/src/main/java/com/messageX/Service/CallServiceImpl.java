package com.messageX.Service;

import com.messageX.Controller.Dtos.Call.*;
import com.messageX.Entity.*;
import com.messageX.Entity.Enum.CallStatus;
import com.messageX.Entity.Enum.ChatType;
import com.messageX.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;



@Service
@RequiredArgsConstructor
@Transactional
public class CallServiceImpl implements CallService {

    private final CallRepository callRepository;
    private final CallParticipantRepository callParticipantRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final UserRepository userRepository;

    private User getLoggedInUser() {

        User currentUser =
                (User) SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getPrincipal();

        return userRepository.findById(currentUser.getId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    @Override
    public CallResponse startCall(StartCallRequest request) {

        User caller = getLoggedInUser();

        ChatRoom chatRoom = chatRoomRepository
                .findById(request.getChatRoomId())
                .orElseThrow(() ->
                        new RuntimeException("Chat room not found"));

        if (!chatParticipantRepository
                .existsByChatRoomAndUser(chatRoom, caller)) {

            throw new RuntimeException(
                    "You are not a participant of this chat");
        }


        if (chatRoom.getChatType() != ChatType.PRIVATE) {
            throw new RuntimeException(
                    "Calls are only available for private chats");
        }
        if (callRepository
                .findByChatRoomAndStatusIn(
                        chatRoom,
                        List.of(
                                CallStatus.RINGING,
                                CallStatus.ONGOING
                        ))
                .isPresent()) {

            throw new RuntimeException(
                    "A call is already active");
        }

        List<ChatParticipant> participants =
                chatParticipantRepository.findByChatRoomWithUser(chatRoom);

        User receiver = participants.stream()
                .map(ChatParticipant::getUser)
                .filter(u -> !u.getId().equals(caller.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Call call = new Call();
        call.setChatRoom(chatRoom);
        call.setInitiator(caller);
        call.setReceiver(receiver);
        call.setType(request.getType());
        call.setStatus(CallStatus.RINGING);

        call = callRepository.save(call);
        CallParticipant participant = new CallParticipant();


        participant.setCall(call);
        participant.setUser(caller);

        callParticipantRepository.save(participant);

        return mapToResponse(call,caller);
    }

    @Override
    public CallResponse joinCall(JoinCallRequest request) {

        User user = getLoggedInUser();

        Call call = callRepository
                .findById(request.getCallId())
                .orElseThrow(() ->
                        new RuntimeException("Call not found"));

        if (!chatParticipantRepository
                .existsByChatRoomAndUser(
                        call.getChatRoom(),
                        user)) {

            throw new RuntimeException(
                    "You are not a participant of this chat");
        }

        if (call.getStatus() != CallStatus.RINGING) {
            throw new RuntimeException(
                    "Call is no longer available");
        }
        if (call.getInitiator()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Caller cannot join their own call");
        }
        if (!callParticipantRepository
                .existsByCallAndUser(call, user)) {

            CallParticipant participant =
                    new CallParticipant();

            participant.setCall(call);
            participant.setUser(user);

            callParticipantRepository.save(participant);
        }

        call.setStartedAt(LocalDateTime.now());

        call.setStatus(CallStatus.ONGOING);

        callRepository.save(call);

        return mapToResponse(call,user);
    }

    @Override
    public CallResponse endCall(EndCallRequest request) {

        User user = getLoggedInUser();

        Call call = getCallEntity(request.getCallId());

        validateParticipant(call, user);

        if (call.getStatus() != CallStatus.RINGING &&
                call.getStatus() != CallStatus.ONGOING) {

            throw new RuntimeException(
                    "Call is already finished");
        }

        call.setStatus(CallStatus.ENDED);
        call.setEndedAt(java.time.LocalDateTime.now());

        callRepository.save(call);

        CallParticipant participant =
                callParticipantRepository
                        .findByCallAndUser(call, user)
                        .orElse(null);

        if (participant != null &&
                participant.getLeftAt() == null) {

            participant.setLeftAt(
                    java.time.LocalDateTime.now());

            callParticipantRepository.save(participant);
        }

        return mapToResponse(call,user);
    }

    @Override
    public CallResponse rejectCall(EndCallRequest request) {

        User user = getLoggedInUser();

        Call call = getCallEntity(request.getCallId());

        validateParticipant(call, user);

        call.setStatus(CallStatus.REJECTED);
        call.setEndedAt(LocalDateTime.now());

        callRepository.save(call);

        return mapToResponse(call, user);
    }

    @Override
    public CallResponse cancelCall(EndCallRequest request) {

        User user = getLoggedInUser();

        Call call = getCallEntity(request.getCallId());

        if (!call.getInitiator()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Only the caller can cancel the call");
        }

        if (call.getStatus() != CallStatus.RINGING) {
            throw new RuntimeException(
                    "Only a ringing call can be cancelled");
        }

        call.setStatus(CallStatus.CANCELLED);
        call.setEndedAt(java.time.LocalDateTime.now());

        callRepository.save(call);

        return mapToResponse(call,user);
    }

    @Override
    @Transactional(readOnly = true)
    public CallResponse getCall(UUID callId) {

        User user = getLoggedInUser();

        Call call = getCallEntity(callId);

        validateParticipant(call, user);

        return mapToResponse(call,user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallResponse> getMyCalls() {

        User user = getLoggedInUser();

        return callRepository
                .findMyCalls(user)
                .stream()
                .sorted((a, b) -> {

                    LocalDateTime dateA = a.getStartedAt() != null
                            ? a.getStartedAt()
                            : a.getEndedAt();

                    LocalDateTime dateB = b.getStartedAt() != null
                            ? b.getStartedAt()
                            : b.getEndedAt();

                    if (dateA == null && dateB == null) {
                        return 0;
                    }

                    if (dateA == null) {
                        return 1;
                    }

                    if (dateB == null) {
                        return -1;
                    }

                    return dateB.compareTo(dateA);
                })
                .map(call -> mapToResponse(call, user))
                .toList();
    }

    private Call getCallEntity(UUID callId) {

        return callRepository
                .findById(callId)
                .orElseThrow(() ->
                        new RuntimeException("Call not found"));
    }

    private void validateParticipant(
            Call call,
            User user) {

        if (!chatParticipantRepository
                .existsByChatRoomAndUser(
                        call.getChatRoom(),
                        user)) {

            throw new RuntimeException(
                    "You are not a participant of this call");
        }
    }

    private CallResponse mapToResponse(
            Call call,
            User currentUser) {

        CallResponse response = new CallResponse();

        response.setCallId(call.getId());

        response.setChatRoomId(
                call.getChatRoom().getId());

        response.setInitiatorId(
                call.getInitiator().getId());

        response.setType(call.getType());

        response.setStatus(call.getStatus());

        response.setStartedAt(call.getStartedAt());

        response.setEndedAt(call.getEndedAt());

        User otherUser;

        if (call.getInitiator()
                .getId()
                .equals(currentUser.getId())) {

            otherUser = call.getReceiver();

        } else {

            otherUser = call.getInitiator();
        }

        if (otherUser != null) {

            response.setParticipantId(
                    otherUser.getId());

            response.setParticipantName(
                    otherUser.getUsername());

            response.setParticipantProfilePicture(
                    otherUser.getProfilePicture());
        }

        if (call.getStartedAt() != null &&
                call.getEndedAt() != null) {

            long duration =
                    Duration.between(
                            call.getStartedAt(),
                            call.getEndedAt()
                    ).getSeconds();

            response.setDurationSeconds(duration);

        } else {

            response.setDurationSeconds(0L);
        }

        return response;
    }
}