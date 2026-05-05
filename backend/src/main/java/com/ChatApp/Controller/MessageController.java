package com.ChatApp.Controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.ChatApp.Entity.ChatMessage;
import com.ChatApp.Modal.ChatSummaryDto;
import com.ChatApp.Repository.ChatMessageRepository;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin
public class MessageController {

    private final ChatMessageRepository chatMessageRepository;

    public MessageController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @GetMapping("/{user1}/{user2}")
    public List<ChatMessage> getChat(@PathVariable String user1, @PathVariable String user2) {
        return chatMessageRepository.findChatHistory(user1, user2);
    }

    @GetMapping("/unread/{user}/{other}")
    public long getUnreadCount(@PathVariable String user, @PathVariable String other) {
        return chatMessageRepository.countUnreadMessages(other, user);
    }

    @GetMapping("/summary/{user}/{other}")
    public ChatSummaryDto getChatSummary(@PathVariable String user, @PathVariable String other) {
        long unread = chatMessageRepository.countUnreadMessages(other, user);
        ChatMessage lastMessage = chatMessageRepository
                .findLatestMessage(user, other, PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .orElse(null);

        String lastText = lastMessage != null ? lastMessage.getContent() : "";
        String lastTimestamp = lastMessage != null ? lastMessage.getTimestamp().toString() : "";

        return new ChatSummaryDto(lastText, lastTimestamp, unread);
    }

    @PutMapping("/mark-read/{user}/{other}")
    public ResponseEntity<?> markAsRead(@PathVariable String user, @PathVariable String other) {
        chatMessageRepository.markMessagesAsRead(other, user);
        return ResponseEntity.ok("Messages marked as read");
    }

    @DeleteMapping("/clear/{user1}/{user2}")
    public ResponseEntity<?> clearChat(@PathVariable String user1, @PathVariable String user2) {
        clearChatHistory(user1, user2);
        return ResponseEntity.ok("Chat history cleared from database");
    }

    @PostMapping("/clear/{user1}/{user2}")
    public ResponseEntity<?> clearChatPost(@PathVariable String user1, @PathVariable String user2) {
        clearChatHistory(user1, user2);
        return ResponseEntity.ok("Chat history cleared from database");
    }

    private void clearChatHistory(String user1, String user2) {
        chatMessageRepository.deleteChatHistory(user1, user2);
    }
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam MultipartFile file,
            @RequestParam String senderMobile,
            @RequestParam String receiverMobile) {
        
        try {
            String uploadDir = "uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = file.getOriginalFilename();
            File destination = new File(dir.getAbsolutePath() + File.separator + fileName);
            file.transferTo(destination);

            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(fileName)
                    .toUriString();

            ChatMessage fileMsg = new ChatMessage();
            fileMsg.setSenderMobile(senderMobile);
            fileMsg.setReceiverMobile(receiverMobile);
            fileMsg.setContent(fileUrl);
            fileMsg.setMessageType("file");
            fileMsg.setFileName(fileName);
            fileMsg.setTimestamp(LocalDateTime.now());
            fileMsg.setStatus("delivered"); // Important for your 'seen' query
            
            chatMessageRepository.save(fileMsg);
            Map<String, Object> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("content", fileUrl);
            response.put("messageType", "file");
            response.put("senderMobile", senderMobile);
            response.put("receiverMobile", receiverMobile);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Could not upload file: " + e.getMessage());
        }
    }
    }