package com.messageX.Service;

import com.messageX.Controller.Dtos.User.SearchUserResponse;
import com.messageX.Controller.Dtos.User.UserRequest;
import com.messageX.Controller.Dtos.User.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse getCurrentUser();

    UserResponse updateProfile(UserRequest request);

    List<SearchUserResponse> searchUsers(String keyword);

}