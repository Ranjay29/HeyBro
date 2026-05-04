package com.ChatApp.Security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ChatApp.Entity.User;
import com.ChatApp.Repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtRequestFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);

            String identifier = jwtUtil.extractEmail(token);

            System.out.println("TOKEN SUBJECT: " + identifier);

            if (identifier != null) {

                User user = userRepository.findByEmailIgnoreCase(identifier)
                        .orElseGet(() -> userRepository.findByMobile(identifier).orElse(null));

                if (user != null && jwtUtil.validateToken(token, identifier)) {

                    String role = user.getRole();

                    if (role == null || role.isEmpty()) {
                        role = "USER";
                    }

                    role = role.toUpperCase();

                    String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;

                    List<GrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority(authority));

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(auth);

                    System.out.println("AUTH: " + SecurityContextHolder.getContext().getAuthentication());

                    System.out.println("AUTH SET: " + authority);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}