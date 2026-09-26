package com.messageX.Service;

import com.messageX.Controller.Dtos.Call.*;
import java.util.List;
import java.util.UUID;

public interface CallService {

    CallResponse startCall(StartCallRequest request);

    CallResponse joinCall(JoinCallRequest request);

    CallResponse endCall(EndCallRequest request);

    CallResponse rejectCall(EndCallRequest request);

    CallResponse cancelCall(EndCallRequest request);

    CallResponse getCall(UUID callId);

    List<CallResponse> getMyCalls();
}