package com.hasse.backend.config;

import com.hasse.backend.entity.Role;
import com.hasse.backend.entity.User;
import com.hasse.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("teacher")) {
            User teacher = new User(
                    "teacher",
                    passwordEncoder.encode("teacher123"),
                    Role.TEACHER,
                    "Преподаватель"
            );
            userRepository.save(teacher);
            log.info("Создан аккаунт преподавателя: teacher / teacher123");
        }
    }
}
