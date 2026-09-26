package com.messageX.Controller;

import com.messageX.Controller.Dtos.User.SearchUserResponse;
import com.messageX.Controller.Dtos.User.UserRequest;
import com.messageX.Controller.Dtos.User.UserResponse;
import com.messageX.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {

        return ResponseEntity.ok(
                userService.getCurrentUser()
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody UserRequest request) {

        return ResponseEntity.ok(
                userService.updateProfile(request)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<SearchUserResponse>> searchUsers(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                userService.searchUsers(keyword)
        );
    }
}