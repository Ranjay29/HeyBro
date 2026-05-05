import { useState } from "react";
import { getProfileImageUrl } from '../../utils/getProfileImageUrl';
import "./ChatList.css";

export default function ChatList({ chats, selectedChat, onSelectChat, onDeleteChat, onOpenProfile, lastMessage }) {
  const [search, setSearch] = useState("");
  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <input
          type="text"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="chat-list-items">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="chat-item-left">
              <img
                src={getProfileImageUrl(
                  chat.avatar || chat.profileImage,
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}`
                )}
                alt={chat.name}
                className="chat-avatar"
                onClick={(e) => { e.stopPropagation(); onOpenProfile && onOpenProfile(chat) }}
              />
              <div className="chat-item-info">
                <h3 className="chat-name">{chat.name}</h3>
                <p className="chat-preview">{chat.lastMessage}</p>
              </div>
            </div>

            <div className="chat-item-right">
              <div className="chat-time">{chat.timestamp}</div>
              <div className="unread">
                {chat.unread > 0 && (
                  <div className="unread-badge-container">
                    <span className="unread-badge">{chat.unread}</span>
                  </div>
                )}
                <div className="chat-actions">
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    title="Delete chat"
                  >🗑️</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}