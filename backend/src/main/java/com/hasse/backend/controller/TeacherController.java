package com.hasse.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentTeacher() {
        return ResponseEntity.ok(Map.of("message", "Вы авторизованы как преподаватель"));
    }
}
