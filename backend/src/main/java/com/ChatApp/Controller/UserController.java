package com.ChatApp.Controller;

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
import org.springframework.web.bind.annotation.RestController;

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
    @PreAuthorize("hasAuthority('ROLE_USER')")
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
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public List<User> lookupUsers(@RequestBody Map<String, List<String>> request) {
        List<String> mobiles = request.get("mobiles");
        return userRepository.findByMobileIn(mobiles);
    }

@PutMapping("/update-profile")
public ResponseEntity<?> updateProfile(
        @RequestParam("name") String name,
        @RequestParam("mobile") String mobile,
        @RequestParam(value = "file", required = false) MultipartFile file,
        @AuthenticationPrincipal User currentUser) throws IOException {

    User user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.setName(name);
    user.setMobile(mobile);

    if (file != null && !file.isEmpty()) {

        // delete old image (optional but good)
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
}}