package com.ChatApp.Service;

import com.ChatApp.Modal.ChatMessageDto;
import com.ChatApp.Entity.ChatMessage;
import com.ChatApp.Repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository; // Use ChatMessageRepo

    public ChatMessage sendMessage(ChatMessageDto messageDTO) {
        ChatMessage message = new ChatMessage();
        message.setSenderMobile(messageDTO.getSenderMobile());
        message.setReceiverMobile(messageDTO.getReceiverMobile());
        message.setContent(messageDTO.getContent());
        message.setTimestamp(LocalDateTime.now());
        
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getChat(String user1, String user2) {
        // This calls the query we added to ChatMessageRepository in the previous step
        return chatMessageRepository.findChatHistory(user1, user2);
    }
}