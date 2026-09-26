package com.messageX.Controller.Dtos.Status;

import com.messageX.Entity.Enum.StatusType;
import lombok.Data;

@Data
public class UploadStatusRequest {

    private String mediaUrl;

    private String caption;

    private StatusType type;

}