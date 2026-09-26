package com.messageX.Controller;



import com.messageX.Controller.Dtos.Call.*;
import com.messageX.Service.CallService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/calls")
@RequiredArgsConstructor
public class CallController {

    private final CallService callService;

    @PostMapping("/start")
    public ResponseEntity<CallResponse> startCall(
            @RequestBody StartCallRequest request) {

        return ResponseEntity.ok(
                callService.startCall(request)
        );
    }

    @PostMapping("/join")
    public ResponseEntity<CallResponse> joinCall(
            @RequestBody JoinCallRequest request) {

        return ResponseEntity.ok(
                callService.joinCall(request)
        );
    }

    @PostMapping("/end")
    public ResponseEntity<CallResponse> endCall(
            @RequestBody EndCallRequest request) {

        return ResponseEntity.ok(
                callService.endCall(request)
        );
    }

    @PostMapping("/reject")
    public ResponseEntity<CallResponse> rejectCall(
            @RequestBody EndCallRequest request) {

        return ResponseEntity.ok(
                callService.rejectCall(request)
        );
    }

    @PostMapping("/cancel")
    public ResponseEntity<CallResponse> cancelCall(
            @RequestBody EndCallRequest request) {

        return ResponseEntity.ok(
                callService.cancelCall(request)
        );
    }

    @GetMapping("/{callId}")
    public ResponseEntity<CallResponse> getCall(
            @PathVariable UUID callId) {

        return ResponseEntity.ok(
                callService.getCall(callId)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<CallResponse>> getMyCalls() {

        return ResponseEntity.ok(
                callService.getMyCalls()
        );
    }
}