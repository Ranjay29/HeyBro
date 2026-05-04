package com.ChatApp.Service;

import com.ChatApp.Entity.User;
import com.ChatApp.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository;

	public List<User> getAllUsers() {
		return userRepository.findAll();
	}

	public User updateProfile(User user) {
		return userRepository.save(user);
	}

	public void deleteByEmail(String email) {
		
	}
}