package com.ChatApp.Modal;

public class ChatSummaryDto {
    private String lastMessage;
    private String timestamp;
    private long unread;

    public ChatSummaryDto(String lastMessage, String timestamp, long unread) {
        this.lastMessage = lastMessage;
        this.timestamp = timestamp;
        this.unread = unread;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public long getUnread() {
        return unread;
    }

    public void setUnread(long unread) {
        this.unread = unread;
    }
}
