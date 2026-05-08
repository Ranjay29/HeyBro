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
            return; 

        // 1. Map DTO to Entity
        ChatMessage message = new ChatMessage();
        message.setReceiverMobile(messageDTO.getReceiverMobile());
        message.setSenderMobile(messageDTO.getSenderMobile());
        message.setContent(messageDTO.getContent());
        message.setMessageType(messageDTO.getMessageType() != null ? messageDTO.getMessageType() : "text");
        message.setFileName(messageDTO.getFileName());
        message.setTimestamp(LocalDateTime.now());
        message.setStatus("delivered"); 

        // 2. Save to Database
        chatMessageRepository.save(message);

        // 3. BROADCAST (This MUST match the topic in MessageController)
        messagingTemplate.convertAndSend("/topic/messages", message);
    }

    @MessageMapping("/call-user")
    public void handleCall(CallRequestDTO callRequest) {
        if (callRequest.getReceiverMobile() == null) return;

        messagingTemplate.convertAndSend(
            "/topic/calls/" + callRequest.getReceiverMobile(), 
            callRequest
        );
    }
}