package com.ChatApp.Configuration;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ChatApp.Security.JwtRequestFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	@Autowired
	private JwtRequestFilter jwtRequestFilter;
	
	@Autowired
	private CorsConfig corsConfig;
	
	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
	    .csrf(csrf -> csrf.disable())
	    .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
	    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
	    .authorizeHttpRequests(auth -> auth 
	        .requestMatchers("/ws/**").permitAll()
	        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
			.requestMatchers("/api/auth/me").authenticated()
	        .requestMatchers("/api/messages/upload").authenticated()
	        .requestMatchers("/uploads/**").permitAll() // <--- ADD THIS LINE
	        .requestMatchers("/api/auth/delete-account").authenticated()
	        .requestMatchers("/api/users/**").hasAnyAuthority("USER")
	        .anyRequest().authenticated() 
	    )
	    .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
	    return http.build();
	}
	@Bean
    PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}