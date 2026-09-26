package com.messageX.Controller.Dtos.Message;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileUploadResponse {

    private String url;
    private String fileName;
    private String fileType;
}