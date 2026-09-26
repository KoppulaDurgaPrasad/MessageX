package com.messageX.Controller;


import com.messageX.Controller.Dtos.Chat.*;
import com.messageX.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping("/private")
    public ResponseEntity<ChatRoomResponse> createPrivateChat(
            @RequestBody CreatePrivateChatRequest request) {

        return ResponseEntity.ok(
                chatService.createPrivateChat(request)
        );
    }

    @PostMapping("/group")
    public ResponseEntity<ChatRoomResponse> createGroup(
            @RequestBody CreateGroupRequest request) {

        return ResponseEntity.ok(
                chatService.createGroup(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<ChatRoomResponse>> getMyChats() {

        return ResponseEntity.ok(
                chatService.getMyChats()
        );
    }

    @GetMapping("/{chatRoomId}/participants")
    public ResponseEntity<List<ChatParticipantResponse>> getParticipants(
            @PathVariable UUID chatRoomId) {

        return ResponseEntity.ok(
                chatService.getParticipants(chatRoomId)
        );
    }

    @PutMapping("/group")
    public ResponseEntity<ChatRoomResponse> updateGroup(
            @RequestBody UpdateGroupRequest request) {

        return ResponseEntity.ok(
                chatService.updateGroup(request)
        );
    }

    @PostMapping("/add-member")
    public ResponseEntity<String> addParticipant(
            @RequestBody AddParticipantRequest request) {

        chatService.addParticipant(request);

        return ResponseEntity.ok("Member added successfully");
    }

    @PostMapping("/remove-member")
    public ResponseEntity<String> removeParticipant(
            @RequestBody RemoveParticipantRequest request) {

        chatService.removeParticipant(request);

        return ResponseEntity.ok("Member removed successfully");
    }

    @DeleteMapping("/{chatRoomId}/leave")
    public ResponseEntity<String> leaveChat(
            @PathVariable UUID chatRoomId) {

        chatService.leaveChat(chatRoomId);

        return ResponseEntity.ok("Chat removed successfully");
    }

    @DeleteMapping("/{chatRoomId}")
    public ResponseEntity<String> deleteGroup(@PathVariable UUID chatRoomId) {
        chatService.deleteGroup(chatRoomId);
        return ResponseEntity.ok("Group deleted successfully.");
    }

}

