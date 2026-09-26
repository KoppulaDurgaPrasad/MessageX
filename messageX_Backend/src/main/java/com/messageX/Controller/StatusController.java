package com.messageX.Controller;


import com.messageX.Controller.Dtos.Status.StatusResponse;
import com.messageX.Controller.Dtos.Status.StatusViewResponse;
import com.messageX.Controller.Dtos.Status.UploadStatusRequest;
import com.messageX.Controller.Dtos.Status.ViewStatusRequest;
import com.messageX.Service.StatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/status")
@RequiredArgsConstructor
public class StatusController {

    private final StatusService statusService;

    @PostMapping
    public ResponseEntity<StatusResponse> uploadStatus(
            @RequestBody UploadStatusRequest request) {

        return ResponseEntity.ok(
                statusService.uploadStatus(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<StatusResponse>> getStatuses() {

        return ResponseEntity.ok(
                statusService.getStatuses()
        );
    }

    @GetMapping("/me")
    public ResponseEntity<List<StatusResponse>> getMyStatuses() {

        return ResponseEntity.ok(
                statusService.getMyStatuses()
        );
    }

    @PostMapping("/view")
    public ResponseEntity<String> viewStatus(
            @RequestBody ViewStatusRequest request) {

        statusService.viewStatus(request);

        return ResponseEntity.ok("Status viewed successfully.");
    }

    @GetMapping("/{statusId}/views")
    public ResponseEntity<List<StatusViewResponse>> getStatusViews(
            @PathVariable UUID statusId) {

        return ResponseEntity.ok(
                statusService.getStatusViews(statusId)
        );
    }

    @DeleteMapping("/{statusId}")
    public ResponseEntity<String> deleteStatus(
            @PathVariable UUID statusId) {

        statusService.deleteStatus(statusId);

        return ResponseEntity.ok("Status deleted successfully.");
    }
}