package com.messageX.Service;

import com.messageX.Controller.Dtos.User.SearchUserResponse;
import com.messageX.Controller.Dtos.User.UserRequest;
import com.messageX.Controller.Dtos.User.UserResponse;
import com.messageX.Entity.User;
import com.messageX.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getCurrentUser() {

        User user = getLoggedInUser();

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getPhoneNumber(),
                user.getProfilePicture(),
                user.getAbout(),
                user.getOnline(),
                user.getVerified(),
                user.getProfileCompleted(),
                user.getLastSeen()
        );
    }

    @Override
    @CacheEvict(value = "userSearch", allEntries = true)
    public UserResponse updateProfile(UserRequest request) {

        User user = getLoggedInUser();

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername().trim());
        }

        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }

        if (request.getAbout() != null && !request.getAbout().isBlank()) {
            user.setAbout(request.getAbout().trim());
        }

        user.setProfileCompleted(true);

        user = userRepository.save(user);

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getPhoneNumber(),
                user.getProfilePicture(),
                user.getAbout(),
                user.getOnline(),
                user.getVerified(),
                user.getProfileCompleted(),
                user.getLastSeen()
        );
    }

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }

        User currentUser = (User) authentication.getPrincipal();

        return userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    @Cacheable(value = "userSearch", key = "#keyword")
    public List<SearchUserResponse> searchUsers(String keyword) {

        List<User> users = new ArrayList<>();

        users.addAll(userRepository.findByUsernameContainingIgnoreCase(keyword));
        users.addAll(userRepository.findByPhoneNumberContaining(keyword));

        User currentUser = getLoggedInUser();

        return users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .distinct()
                .map(user -> new SearchUserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getPhoneNumber(),
                        user.getProfilePicture(),
                        user.getOnline()
                ))
                .toList();
    }
}