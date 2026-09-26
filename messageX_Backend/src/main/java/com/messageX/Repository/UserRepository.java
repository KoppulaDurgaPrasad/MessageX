package com.messageX.Repository;

import com.messageX.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findByRefreshToken(String refreshToken);

    List<User> findByUsernameContainingIgnoreCase(String username);

    List<User> findByPhoneNumberContaining(String phoneNumber);

}
