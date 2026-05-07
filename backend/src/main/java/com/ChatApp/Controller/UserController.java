package com.ChatApp.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.bind.annotation.PathVariable;

import com.ChatApp.Entity.User;
import com.ChatApp.Repository.UserRepository;
import com.ChatApp.Service.UserService;

@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "https://ranjay29.github.io",
        "https://heybro-frontend.vercel.app",
        "https://heybro-frontend.netlify.app"
    },
    allowedHeaders = "*",
    allowCredentials = "true"
)
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

@GetMapping("/profile-image/{fileName:.+}")
public ResponseEntity<Resource> getProfileImage(
        @PathVariable String fileName) throws IOException {

    Path path = Paths.get("profile-images").resolve(fileName).normalize();

    Resource resource = new UrlResource(path.toUri());

    if (!resource.exists() || !resource.isReadable()) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_JPEG)
            .body(resource);
}

@PutMapping(value = "/update-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> updateProfile(
        @RequestParam(value = "name", required = false) String name,
        @RequestParam(value = "email", required = false) String email,
        @RequestParam(value = "mobile", required = false) String mobile,
        @RequestParam(value = "file", required = false) MultipartFile file,
        @AuthenticationPrincipal User currentUser) throws IOException {

    if (currentUser == null) {
        return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
    }

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
    try {

        Path uploadsDir = Paths.get("profile-images");

        if (!Files.exists(uploadsDir)) {
            Files.createDirectories(uploadsDir);
        }

        if (user.getProfileImage() != null && !user.getProfileImage().isBlank()) {
            Path oldPath = uploadsDir.resolve(user.getProfileImage()).normalize();
            Files.deleteIfExists(oldPath);
        }

        String originalName = file.getOriginalFilename();

        String extension =
                (originalName != null && originalName.contains("."))
                        ? originalName.substring(originalName.lastIndexOf("."))
                        : ".jpg";

        String fileName =
                "user_" + user.getId() + "_" + System.currentTimeMillis() + extension;

        Path filePath = uploadsDir.resolve(fileName).normalize();

        Files.copy(
                file.getInputStream(),
                filePath,
                java.nio.file.StandardCopyOption.REPLACE_EXISTING
        );

        user.setProfileImage(fileName);

    } catch (Exception e) {

        return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to save image: " + e.getMessage(),
                "error", "FILE_SAVE_ERROR"
        ));
    }
}
    userRepository.save(user);
    return ResponseEntity.ok(user);
}
}