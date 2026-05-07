package com.ChatApp.Controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

import com.ChatApp.Entity.User;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/auth-check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> checkAuth(@AuthenticationPrincipal User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", true);
        response.put("userId", user != null ? user.getId() : "null");
        response.put("userEmail", user != null ? user.getEmail() : "null");
        response.put("userName", user != null ? user.getName() : "null");
        return ResponseEntity.ok(response);
    }
}
