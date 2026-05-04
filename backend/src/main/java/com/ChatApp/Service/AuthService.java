package com.ChatApp.Service;

import com.ChatApp.Dto.LoginRequest;
import com.ChatApp.Entity.User;
import com.ChatApp.Repository.UserRepository;
import com.ChatApp.Security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtUtil jwtUtil;

	public Map<String, Object> login(LoginRequest request) {

	    User user = userRepository
	    	.findByEmailIgnoreCase(request.getEmail().trim())
	        .orElseThrow(() -> new RuntimeException("User not found"));
	    System.out.println("LOGIN EMAIL: " + request.getEmail());
	    System.out.println("RAW PASSWORD: " + request.getPassword());
	    System.out.println("DB PASSWORD: " + user.getPassword());

	    boolean match = passwordEncoder.matches(request.getPassword(), user.getPassword());
	    System.out.println("PASSWORD MATCH: " + match);

	    if (!match) {
	        throw new RuntimeException("Invalid password");
	    }
	    
	    // Ensure user has a role (default to USER if null)
	    if (user.getRole() == null || user.getRole().isEmpty()) {
	        user.setRole("USER");
	        userRepository.save(user);
	    }
	    
	    String token = jwtUtil.generateToken(user.getEmail());
	    Map<String, Object> response = new HashMap<>();
	    response.put("token", token);
	    response.put("id", user.getId());
	    response.put("name", user.getName());
	    response.put("email", user.getEmail());
	    response.put("mobile", user.getMobile());
	    response.put("role", user.getRole());
	    return response;
	}
	public Object register(User user) {
	    if (userRepository.findByEmailIgnoreCase(user.getEmail()).isPresent()) {
	        throw new RuntimeException("Email already exists");
	    }
	    // ✅ encode password
	    user.setPassword(passwordEncoder.encode(user.getPassword()));

	    // ✅ set default role
	    if (user.getRole() == null) {
	        user.setRole("USER");
	    }
	    User savedUser = userRepository.save(user);

	    Map<String, Object> response = new HashMap<>();
	    response.put("message", "User registered successfully");
	    response.put("email", savedUser.getEmail());

	    return response;
	}
	// Inside AuthService.java
	public User findByEmail(String email) {
	    return userRepository.findByEmailIgnoreCase(email)
	            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
	}
	public void deleteByEmail(String email) {
	    User user = userRepository.findByEmail(email)
	        .orElseThrow(() -> new RuntimeException("User not found"));

	    userRepository.delete(user);
	}
}