package com.messageX.Controller;

import com.messageX.Controller.Dtos.Message.*;
import com.messageX.Entity.User;
import com.messageX.Service.CloudinaryService;
import com.messageX.Service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final CloudinaryService cloudinaryService;

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @RequestBody SendMessageRequest request) {

        return ResponseEntity.ok(
                messageService.sendMessage(request)
        );
    }

    @GetMapping("/{chatRoomId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable UUID chatRoomId) {

        return ResponseEntity.ok(
                messageService.getMessages(chatRoomId)
        );
    }

    @PutMapping("/edit")
    public ResponseEntity<MessageResponse> editMessage(
            @RequestBody EditMessageRequest request) {

        return ResponseEntity.ok(
                messageService.editMessage(request)
        );
    }

    @DeleteMapping("/delete-for-me")
    public ResponseEntity<String> deleteForMe(
            @RequestBody DeleteMessageRequest request) {

        messageService.deleteForMe(request);

        return ResponseEntity.ok("Message deleted for you.");
    }

    @DeleteMapping("/delete-for-everyone")
    public ResponseEntity<String> deleteForEveryone(
            @RequestBody DeleteMessageRequest request) {

        messageService.deleteForEveryone(request);

        return ResponseEntity.ok("Message deleted for everyone.");
    }

    @PutMapping("/delivered")
    public ResponseEntity<MessageStatusResponse> markDelivered(
            @RequestBody UpdateMessageStatusRequest request) {

        return ResponseEntity.ok(
                messageService.markDelivered(request)
        );
    }

    @PutMapping("/seen")
    public ResponseEntity<MessageStatusResponse> markSeen(
            @RequestBody UpdateMessageStatusRequest request) {

        return ResponseEntity.ok(
                messageService.markSeen(request)
        );
    }

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file) {

        String url = cloudinaryService.uploadFile(file, "messages");

        String type = file.getContentType();

        String fileType;

        if (type != null && type.startsWith("image")) {
            fileType = "IMAGE";
        } else if (type != null && type.startsWith("video")) {
            fileType = "VIDEO";
        } else if (type != null && type.startsWith("audio")) {
            fileType = "AUDIO";
        } else {
            fileType = "DOCUMENT";
        }

        FileUploadResponse response =
                FileUploadResponse.builder()
                        .url(url)
                        .fileName(file.getOriginalFilename())
                        .fileType(fileType)
                        .build();

        return ResponseEntity.ok(response);
    }

}