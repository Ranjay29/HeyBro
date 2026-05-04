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

@CrossOrigin(origins = {"http://localhost:5173", "https://ranjay29.github.io"}) 
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    public UserService userService;
    public JwtUtil jwtUtil;

    public AuthController(AuthService authService, UserService userService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
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

        try {
            // Get the User object directly from the authentication principal
            User user = (User) auth.getPrincipal();
            
            // Ensure user has a role (default to USER if null)
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("USER");
                userService.updateProfile(user);
            }
            
            return org.springframework.http.ResponseEntity.ok(user);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(404).body("User not found: " + e.getMessage());
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