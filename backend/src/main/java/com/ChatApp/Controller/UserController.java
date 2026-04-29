package com.ChatApp.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.ChatApp.Entity.ResponseEntity;
import com.ChatApp.Entity.User;
import com.ChatApp.Repository.UserRepository;
import com.ChatApp.Service.UserService;

@Controller
	@RequestMapping("/api/users")
	public class UserController {

	    @Autowired
	    private UserService userService;

	    @Autowired
	    private UserRepository userRepository;

	    @GetMapping
	    @PreAuthorize("hasAuthority('USER')")
	    public Object getAllUsers(@AuthenticationPrincipal User currentUser) {

	        if (currentUser == null) {
	            return ResponseEntity.status(401);
	        }

	        List<User> users = userService.getAllUsers()
	                .stream()
	                .filter(u -> !u.getId().equals(currentUser.getId()))
	                .toList();

	        return ResponseEntity.ok(users);
	    }

	    @PostMapping("/lookup")
	    @PreAuthorize("hasAuthority('USER')")
	    public List<User> lookupUsers(@RequestBody Map<String, List<String>> request) {
	        List<String> mobiles = request.get("mobiles");
	        return userRepository.findByMobileIn(mobiles);
	    }
}