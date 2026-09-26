package com.messageX.Service;

import com.messageX.Controller.Dtos.Status.StatusResponse;
import com.messageX.Controller.Dtos.Status.StatusViewResponse;
import com.messageX.Controller.Dtos.Status.UploadStatusRequest;
import com.messageX.Controller.Dtos.Status.ViewStatusRequest;

import java.util.List;
import java.util.UUID;

public interface StatusService {

    StatusResponse uploadStatus(UploadStatusRequest request);

    List<StatusResponse> getStatuses();

    List<StatusResponse> getMyStatuses();

    void viewStatus(ViewStatusRequest request);

    List<StatusViewResponse> getStatusViews(UUID statusId);

    void deleteStatus(UUID statusId);

}
