package com.messageX.Service;


import com.messageX.Controller.Dtos.Status.StatusResponse;
import com.messageX.Controller.Dtos.Status.StatusViewResponse;
import com.messageX.Controller.Dtos.Status.UploadStatusRequest;
import com.messageX.Controller.Dtos.Status.ViewStatusRequest;
import com.messageX.Entity.Status;
import com.messageX.Entity.StatusView;
import com.messageX.Entity.User;
import com.messageX.Repository.StatusRepository;
import com.messageX.Repository.StatusViewRepository;
import com.messageX.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StatusServiceImpl implements StatusService {

    private final StatusRepository statusRepository;
    private final StatusViewRepository statusViewRepository;
    private final UserRepository userRepository;

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }

        User currentUser = (User) authentication.getPrincipal();

        return userRepository.findById(currentUser.getId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private StatusResponse mapToStatusResponse(
            Status status,
            User currentUser
    ) {

        boolean viewed =
                status.getUser().getId().equals(currentUser.getId())
                        || statusViewRepository
                        .existsByStatusAndViewer(status, currentUser);

        return new StatusResponse(
                status.getId(),
                status.getUser().getId(),
                status.getUser().getUsername(),
                status.getUser().getProfilePicture(),
                status.getMediaUrl(),
                status.getCaption(),
                status.getType(),
                status.getCreatedAt(),
                status.getExpiresAt(),
                viewed
        );
    }

    private StatusViewResponse mapToStatusViewResponse(StatusView statusView) {

        return new StatusViewResponse(

                statusView.getViewer().getId(),

                statusView.getViewer().getUsername(),

                statusView.getViewer().getProfilePicture(),

                statusView.getViewedAt()
        );
    }

    @Override
    @Transactional
    public StatusResponse uploadStatus(UploadStatusRequest request) {

        User currentUser = getLoggedInUser();

        if (request.getType() == null) {
            throw new RuntimeException("Status type is required.");
        }

        if (request.getMediaUrl() == null || request.getMediaUrl().isBlank()) {
            throw new RuntimeException("Media URL is required.");
        }

        Status status = new Status();

        status.setUser(currentUser);
        status.setMediaUrl(request.getMediaUrl().trim());
        status.setCaption(
                request.getCaption() != null
                        ? request.getCaption().trim()
                        : null
        );
        status.setType(request.getType());

        status = statusRepository.save(status);

        return mapToStatusResponse(status,currentUser);
    }

    @Override
    public List<StatusResponse> getStatuses() {

        User currentUser = getLoggedInUser();

        List<Status> statuses =
                statusRepository.findActiveStatusesWithUser(
                        LocalDateTime.now()
                );

        return statuses.stream()
                .filter(status ->
                        !status.getUser().getId().equals(currentUser.getId())
                )
                .map(status ->
                        mapToStatusResponse(status, currentUser)
                )
                .toList();
    }

    @Override
    public List<StatusResponse> getMyStatuses() {

        User currentUser = getLoggedInUser();

        List<Status> statuses =
                statusRepository.findByUserWithUserOrderByCreatedAtDesc(currentUser);

        LocalDateTime now = LocalDateTime.now();

        return statuses.stream()
                .filter(status -> status.getExpiresAt().isAfter(now))
                .map(status ->
                        mapToStatusResponse(status, currentUser)
                )
                .toList();
    }

    @Override
    public void viewStatus(ViewStatusRequest request) {

        User currentUser = getLoggedInUser();

        Status status = statusRepository.findByIdWithUser(request.getStatusId())
                .orElseThrow(() -> new RuntimeException("Status not found"));


        if (status.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Status has expired.");
        }

        if (status.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You cannot view your own status.");
        }

        if (statusViewRepository.existsByStatusAndViewer(status, currentUser)) {
            return;
        }

        StatusView statusView = new StatusView();

        statusView.setStatus(status);
        statusView.setViewer(currentUser);

        statusViewRepository.save(statusView);
    }

    @Override
    public List<StatusViewResponse> getStatusViews(UUID statusId) {

        User currentUser = getLoggedInUser();

        Status status = statusRepository.findByIdWithUser(statusId)
                .orElseThrow(() -> new RuntimeException("Status not found"));

        if (!status.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to view status viewers.");
        }
        if (status.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Status has expired.");
        }

        List<StatusView> statusViews =
                statusViewRepository.findByStatusWithViewer(status);

        return statusViews.stream()
                .map(this::mapToStatusViewResponse)
                .toList();
    }

    @Override
    public void deleteStatus(UUID statusId) {

        User currentUser = getLoggedInUser();

        Status status = statusRepository.findById(statusId)
                .orElseThrow(() ->
                        new RuntimeException("Status not found."));

        if (!status.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can delete only your own status.");
        }

        List<StatusView> statusViews =
                statusViewRepository.findByStatus(status);

        statusViewRepository.deleteAll(statusViews);

        statusRepository.delete(status);
    }
}




