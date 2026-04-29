package com.ChatApp.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.ChatApp.Dto.LoginRequest;
import com.ChatApp.Entity.User;
import com.ChatApp.Security.JwtUtil;
import com.ChatApp.Service.AuthService;
import com.ChatApp.Service.UserService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // allow frontend
public class AuthController {

    private final AuthService authService;
    public UserService userService;
    public JwtUtil jwtUtil;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public org.springframework.http.ResponseEntity<?> register(@RequestBody User user) {
        return org.springframework.http.ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return org.springframework.http.ResponseEntity.ok(authService.login(request));
    }

 // Inside AuthController.java
    @GetMapping("/me")
    public org.springframework.http.ResponseEntity<?> getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return org.springframework.http.ResponseEntity.status(401).body("Unauthorized");
        }

        // auth.getName() extracts the email/subject from your JWT token
        String email = auth.getName(); 
        
        try {
            // Fetch the actual User entity from the DB
            User user = authService.findByEmail(email);
            return org.springframework.http.ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return org.springframework.http.ResponseEntity.status(404).body(e.getMessage());
        }
    }
    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String email = jwtUtil.extractUsername(token);
        userService.deleteByEmail(email);
        return ResponseEntity.ok("Account deleted successfully");
    }
}