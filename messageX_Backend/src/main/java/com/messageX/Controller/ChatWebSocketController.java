package com.messageX.Controller;

import com.messageX.Controller.Dtos.Message.DeleteMessageRequest;
import com.messageX.Controller.Dtos.Message.EditMessageRequest;
import com.messageX.Controller.Dtos.Message.MessageResponse;
import com.messageX.Controller.Dtos.Message.SendMessageRequest;
import com.messageX.Controller.Dtos.WebSocket.CallSignalMessage;
import com.messageX.Controller.Dtos.WebSocket.ChatMessage;
import com.messageX.Controller.Dtos.WebSocket.TypingMessage;
import com.messageX.Entity.User;
import com.messageX.Repository.UserRepository;
import com.messageX.Service.ChatService;
import com.messageX.Service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final UserRepository userRepository;
    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(
            ChatMessage chatMessage,
            Principal principal) {

        if (!(principal instanceof Authentication authentication)) {
            throw new RuntimeException(
                    "WebSocket user is not authenticated."
            );
        }

        User sender =
                (User) authentication.getPrincipal();

        SendMessageRequest request =
                new SendMessageRequest();

        request.setChatRoomId(
                chatMessage.getChatRoomId()
        );

        request.setContent(
                chatMessage.getContent()
        );

        request.setMediaUrl(
                chatMessage.getMediaUrl()
        );

        request.setFileName(chatMessage.getFileName());

        request.setType(
                chatMessage.getType()
        );

        MessageResponse response =
                messageService.sendMessage(
                        request,
                        sender
                );

        messagingTemplate.convertAndSend(
                "/topic/chat/" +
                        chatMessage.getChatRoomId(),
                response
        );
    }

    @MessageMapping("/chat.editMessage")
    public void editMessage(
            EditMessageRequest request,
            Principal principal
    ) {

        if (!(principal instanceof Authentication authentication)) {
            throw new RuntimeException(
                    "WebSocket user is not authenticated."
            );
        }

        User editor = (User) authentication.getPrincipal();

        MessageResponse response =
                messageService.editMessage(request, editor);

        messagingTemplate.convertAndSend(
                "/topic/chat/" + request.getChatRoomId(),
                response
        );
    }

    @MessageMapping("/chat.typing")
    public void typing(TypingMessage message) {

        messagingTemplate.convertAndSend(
                "/topic/chat/" +
                        message.getChatRoomId() +
                        "/typing",
                message
        );
    }

    @MessageMapping("/chat.deleteForMe")
    public void deleteForMe(
            DeleteMessageRequest request,
            Principal principal
    ) {

        if (!(principal instanceof Authentication authentication)) {
            throw new RuntimeException(
                    "WebSocket user is not authenticated."
            );
        }

        User user = (User) authentication.getPrincipal();

        messageService.deleteForMe(request, user);
    }

    @MessageMapping("/chat.deleteForEveryone")
    public void deleteForEveryone(
            DeleteMessageRequest request,
            Principal principal
    ) {

        if (!(principal instanceof Authentication authentication)) {
            throw new RuntimeException(
                    "WebSocket user is not authenticated."
            );
        }

        User user = (User) authentication.getPrincipal();

        MessageResponse response =
                messageService.deleteForEveryone(request, user);

        messagingTemplate.convertAndSend(
                "/topic/chat/" +
                        response.getChatRoomId(),
                response
        );
    }

    @MessageMapping("/call.signal")
    public void callSignal(
            CallSignalMessage message,
            Principal principal
    ) {

        if (!(principal instanceof Authentication authentication)) {
            throw new RuntimeException(
                    "WebSocket user is not authenticated."
            );
        }

        User sender =
                (User) authentication.getPrincipal();

        message.setSenderId(sender.getId());
        message.setSenderName(sender.getUsername());
        message.setSenderProfilePicture(sender.getProfilePicture());

        if (message.getReceiverId() == null) {
            throw new RuntimeException(
                    "Receiver ID is required for call signaling."
            );
        }

        User receiver =
                userRepository.findById(
                        message.getReceiverId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Receiver not found."
                        )
                );

        messagingTemplate.convertAndSendToUser(
                receiver.getId().toString(),
                "/queue/call",
                message
        );
    }

    @MessageMapping("/chat.leaveGroup")
    public void leaveGroup(UUID chatRoomId) {

        MessageResponse response = chatService.leaveChat(chatRoomId);

        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatRoomId,
                response
        );
    }

}