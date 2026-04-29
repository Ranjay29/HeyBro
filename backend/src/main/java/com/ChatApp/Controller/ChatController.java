	package com.ChatApp.Controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.ChatApp.Entity.ChatMessage;
import com.ChatApp.Modal.CallRequestDTO;
import com.ChatApp.Modal.ChatMessageDto;
import com.ChatApp.Repository.ChatMessageRepository;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat")
    public void sendMessage(ChatMessageDto messageDTO) {

    	if (messageDTO.getSenderMobile() == null || messageDTO.getReceiverMobile() == null) 
    	    return; // don't crash server
    	
    	
        // ✅ Save message
        ChatMessage message = new ChatMessage();
        message.setReceiverMobile(messageDTO.getReceiverMobile());
        message.setSenderMobile(messageDTO.getSenderMobile());
        message.setContent(messageDTO.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setStatus("delivered"); // Important for your 'seen' query

        chatMessageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/messages",message);        
    }
    
 // NEW: Handle Real-time Call Routing
    @MessageMapping("/call-user")
    public void handleCall(CallRequestDTO callRequest) {
        if (callRequest.getReceiverMobile() == null) {
            return;
        }

        // Send the call notification to a specific user's topic
        // Frontend will subscribe to: /topic/calls/{myMobileNumber}
        messagingTemplate.convertAndSend(
            "/topic/calls/" + callRequest.getReceiverMobile(), 
            callRequest
        );
    }
}