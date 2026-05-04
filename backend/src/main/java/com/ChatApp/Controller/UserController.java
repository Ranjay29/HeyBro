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
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedUser, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        User userToUpdate = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedUser.getName() != null && !updatedUser.getName().isEmpty()) {
            userToUpdate.setName(updatedUser.getName());
        }
        if (updatedUser.getMobile() != null && !updatedUser.getMobile().isEmpty()) {
            userToUpdate.setMobile(updatedUser.getMobile());
        }
        if (updatedUser.getProfileImage() != null && !updatedUser.getProfileImage().isEmpty()) {
            userToUpdate.setProfileImage(updatedUser.getProfileImage());
        }

        User updated = userService.updateProfile(userToUpdate);
        return ResponseEntity.ok(updated);
    }
}