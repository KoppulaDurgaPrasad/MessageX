package com.messageX.Controller;

import com.messageX.Service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder) {

        String url = cloudinaryService.uploadFile(
                file,
                "messagex/" + folder
        );

        return ResponseEntity.ok(url);
    }

}
