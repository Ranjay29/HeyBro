package com.ChatApp.Entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderMobile;
    private String receiverMobile;

    private String content;       // text message OR file URL
    private String messageType;   // TEXT, IMAGE, FILE
    private String fileName;

    private LocalDateTime timestamp;
    private String status; // optional

    @Enumerated(EnumType.STRING)
    private MessageStatus messageStatus;

    private boolean isRead = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSenderMobile() { return senderMobile; }
    public void setSenderMobile(String senderMobile) { this.senderMobile = senderMobile; }

    public String getReceiverMobile() { return receiverMobile; }
    public void setReceiverMobile(String receiverMobile) { this.receiverMobile = receiverMobile; }

    public String getContent() { return content; }
    public void setContent(String object) { this.content = object; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public MessageStatus getMessageStatus() { return messageStatus; }
    public void setMessageStatus(MessageStatus messageStatus) {
        this.messageStatus = messageStatus;
    }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}