package com.ChatApp.Modal;

public class ChatSummaryDto {

    private String lastMessage;
    private String timestamp;
    private String unread;
    private String messageType;
    private String fileName;

    public ChatSummaryDto(
            String lastMessage,
            String timestamp,
            String unread,
            String messageType,
            String fileName
    ) {
        this.lastMessage = lastMessage;
        this.timestamp = timestamp;
        this.unread = unread;
        this.messageType = messageType;
        this.fileName = fileName;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getUnread() {
        return unread;
    }

    public String getMessageType() {
        return messageType;
    }

    public String getFileName() {
        return fileName;
    }
}