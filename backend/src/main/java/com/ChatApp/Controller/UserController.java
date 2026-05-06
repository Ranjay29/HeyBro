package com.ChatApp.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ChatApp.Entity.User;
import com.ChatApp.Repository.UserRepository;
import com.ChatApp.Service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Object getAllUsers(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        List<User> users = userService.getAllUsers()
                .stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .toList();

        return ResponseEntity.ok(users);
    }

    @PostMapping("/lookup")
    @PreAuthorize("isAuthenticated()")
    public List<User> lookupUsers(@RequestBody Map<String, List<String>> request) {
        List<String> mobiles = request.get("mobiles");
        return userRepository.findByMobileIn(mobiles);
    }

@PutMapping("/update-profile")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> updateProfile(
        @RequestParam(value = "name", required = false) String name,
        @RequestParam(value = "email", required = false) String email,
        @RequestParam(value = "mobile", required = false) String mobile,
        @RequestParam(value = "file", required = false) MultipartFile file,
        @AuthenticationPrincipal User currentUser) throws IOException {

    User user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (name != null && !name.isBlank()) {
        user.setName(name.trim());
    }
    if (email != null && !email.isBlank()) {
        user.setEmail(email.trim());
    }
    if (mobile != null && !mobile.isBlank()) {
        user.setMobile(mobile.trim());
    }

    if (file != null && !file.isEmpty()) {
        if (user.getProfileImage() != null) {
            Path oldPath = Paths.get("uploads", user.getProfileImage());
            Files.deleteIfExists(oldPath);
        }

        String fileName = "user_" + user.getId() + "_" + System.currentTimeMillis() + ".jpg";
        Path path = Paths.get("uploads", fileName);
        Files.write(path, file.getBytes());

        user.setProfileImage(fileName);
    }

    userRepository.save(user);
    return ResponseEntity.ok(user);
}
}