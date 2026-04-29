package com.ChatApp.Modal;

public class CallRequestDTO {
    private String callerName;
    private String callerMobile;
    private String receiverMobile;
    private String roomID;
    private String type; // "voice" or "video"

    // Default Constructor
    public CallRequestDTO() {}

    // Getters and Setters
    public String getCallerName() { return callerName; }
    public void setCallerName(String callerName) { this.callerName = callerName; }

    public String getCallerMobile() { return callerMobile; }
    public void setCallerMobile(String callerMobile) { this.callerMobile = callerMobile; }

    public String getReceiverMobile() { return receiverMobile; }
    public void setReceiverMobile(String receiverMobile) { this.receiverMobile = receiverMobile; }

    public String getRoomID() { return roomID; }
    public void setRoomID(String roomID) { this.roomID = roomID; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}