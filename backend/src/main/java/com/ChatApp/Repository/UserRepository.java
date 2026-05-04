package com.ChatApp.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ChatApp.Entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmailIgnoreCase(String email);
	Optional<User> findByEmail(String email);
	List<User> findByMobileIn(List<String> mobiles);
	Optional<User> findByMobile(String mobile);
	}