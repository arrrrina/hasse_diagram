package com.hasse.backend.controller;

import com.hasse.backend.dto.AuthResponse;
import com.hasse.backend.dto.LoginRequest;
import com.hasse.backend.dto.RegisterRequest;
import com.hasse.backend.entity.Role;
import com.hasse.backend.entity.User;
import com.hasse.backend.repository.UserRepository;
import com.hasse.backend.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Неверный логин или пароль");
        }

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getFullName(), user.getVariantNumber()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Пользователь с таким логином уже существует");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Некорректная роль");
        }

        if (role == Role.STUDENT) {
            if (request.getGroupNumber() == null || request.getGroupNumber().isBlank()) {
                return ResponseEntity.badRequest().body("Для студента нужно указать номер группы");
            }
            if (request.getVariantNumber() == null || request.getVariantNumber() <= 0) {
                return ResponseEntity.badRequest().body("Для студента нужно указать корректный номер варианта");
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setMiddleName(request.getMiddleName().trim());
        user.setFullName(String.format("%s %s %s", request.getLastName().trim(), request.getFirstName().trim(), request.getMiddleName().trim()));
        user.setGroupNumber(role == Role.STUDENT ? request.getGroupNumber().trim() : null);
        user.setVariantNumber(role == Role.STUDENT ? request.getVariantNumber() : null);
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}
