package com.messageX.Repository;

import com.messageX.Entity.Call;
import com.messageX.Entity.CallParticipant;
import com.messageX.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CallParticipantRepository extends JpaRepository<CallParticipant, UUID> {

    List<CallParticipant> findByCall(Call call);

    List<CallParticipant> findByUser(User user);

    boolean existsByCallAndUser(Call call, User user);

    Optional<CallParticipant> findByCallAndUser(Call call, User user);

    long countByCall(Call call);

}