package com.ChatApp.Security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders == null || authHeaders.isEmpty()) {
                System.out.println("❌ Missing Authorization Header (CONNECT)");
                return message; 
            }
            
            String token = authHeaders.get(0).replace("Bearer ", "");
            try {
                String username = jwtUtil.extractUsername(token);

                if (jwtUtil.validateToken(token, username)) {
                    accessor.setUser(
                        new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            List.of()
                        )
                    );
                    System.out.println("✅ WebSocket Authenticated: " + username);
                } else {
                    System.out.println("❌ Invalid Token");
                }
            } catch (Exception e) {
                System.out.println("❌ JWT Error: " + e.getMessage());
            }
        }
        return message;
    }
}