import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header/Header';
import axios from '../../api/axiosConfig';
import ChatList from '../../components/ChatList/ChatList';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import FloatingChatButton from '../../components/FloatingChatButton/FloatingChatButton';
import ProfileModal from '../../components/ProfileModal/ProfileModal';
import './ChatDashboard.css';

export default function ChatDashboard({ userData }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedChat, setSelectedChat] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const normalizePhone = (phone) => {
    if (!phone) return '';
    let digits = phone.toString().replace(/\D/g, '');
    return digits.slice(-10);
  };

  const currentUserMobile = normalizePhone(userData?.mobile || localStorage.getItem("mobile"));
  const chatStorageKey = `chats_${currentUserMobile}`;

  const [chats, setChats] = useState(() => {
    try {
      if (!currentUserMobile) return [];
      const saved = localStorage.getItem(chatStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // Function to fetch unread counts and last message preview for all chats
  const fetchChatSummaries = async () => {
    if (!currentUserMobile || !chats.length) return;

    try {
      const updatedChats = await Promise.all(
        chats.map(async (chat) => {
          const chatMobile = normalizePhone(chat.id || chat.mobile);
          try {
            const res = await axios.get(`/messages/summary/${currentUserMobile}/${chatMobile}`);
            return {
              ...chat,
              unread: res.data.unread,
              lastMessage: res.data.lastMessage || chat.lastMessage || '',
              timestamp: res.data.timestamp
                ? new Date(res.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : chat.timestamp,
            };
          } catch (err) {
            console.error(`Failed to fetch chat summary for ${chatMobile}:`, err);
            return chat;
          }
        })
      );
      setChats(updatedChats);
    } catch (err) {
      console.error("Failed to fetch chat summaries:", err);
    }
  };

  // Function to mark messages as read when chat is opened
  const markMessagesAsRead = useCallback(async (chatMobile) => {
    try {
      await axios.put(`/messages/mark-read/${currentUserMobile}/${chatMobile}`);
      // Update the unread count for this chat
      setChats(prev => prev.map(c =>
        normalizePhone(c.id || c.mobile) === chatMobile
          ? { ...c, unread: 0 } : c
      ));
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  }, [currentUserMobile, normalizePhone]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentUserMobile) {
      localStorage.setItem(chatStorageKey, JSON.stringify(chats));
    }
  }, [chats, currentUserMobile, chatStorageKey]);

  // Fetch chat summaries on component mount and when the chat list count changes
  useEffect(() => {
    if (currentUserMobile) {
      fetchChatSummaries();
    }
  }, [currentUserMobile, chats.length]);

  useEffect(() => {
    if (location.state?.selectedChat) {
      const incoming = location.state.selectedChat;
      const normalizedId = normalizePhone(incoming.mobile || incoming.phone || incoming.id);

      setChats(prevChats => {
        const exists = prevChats.find(c => normalizePhone(c.id || c.mobile) === normalizedId);
        if (!exists) {
          const newEntry = {
            ...incoming,
            id: normalizedId,
            mobile: normalizedId,
            lastMessage: '',
            timestamp: '',
            unread: 0,
            messages: []
          };
          return [newEntry, ...prevChats];
        }
        return prevChats;
      });

      setSelectedChat(incoming);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // UPDATED: Sync Sidebar with Unread Logic
  const handleUpdateSidebar = useCallback(async (text, senderId, isOwnMessage = false) => {
    const normalizedSender = normalizePhone(senderId);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChats(prev => {
      return prev.map(chat => {
        const chatMobile = normalizePhone(chat.id || chat.mobile);
        if (chatMobile === normalizedSender) {
          return {
            ...chat,
            lastMessage: text, 
            timestamp: now,
            unread: (!selectedChat || normalizePhone(selectedChat.id) !== normalizedSender) && !isOwnMessage
              ? (chat.unread || 0) + 1
              : (chat.unread || 0)
          };
        }
        return chat;
      }).sort((a, b) => (a.id === normalizedSender ? -1 : 1)); // Simplified move to top
    });
  }, [selectedChat, normalizePhone]);

  const handleDeleteChat = async (idToDelete) => {
    const normalizedTarget = normalizePhone(idToDelete);
    if (!window.confirm("Delete this chat and all history?")) return;
    try {
      await axios.delete(`/messages/clear/${currentUserMobile}/${normalizedTarget}`);
      setChats(prev => prev.filter(c => normalizePhone(c.id || c.mobile) !== normalizedTarget));
      if (selectedChat && normalizePhone(selectedChat.mobile || selectedChat.id) === normalizedTarget) {
        setSelectedChat(null);
      }
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  if (!userData) return <div className="loading-screen">Loading HeyBro...</div>;

  return (
    <div className="chat-dashboard">
      <Header userData={userData} />
      <div className="status-bar">
        <div className="status-left">
          {JSON.parse(localStorage.getItem('app_settings'))?.onlineStatus !== false ? (
            <>
              <span className="status-dot"></span> Status: <strong>Online</strong>
            </>
          ) : (
            <>Status: <strong>Hidden</strong></>
          )}

        </div>
        <div className="status-right">User: {currentUserMobile}</div>
      </div>

      <div className="chat-main">
        {(!isMobile || !selectedChat) && (
          <div className="chat-sidebar">
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={(chat) => {
                setSelectedChat(chat);
                // Mark messages as read when chat is opened
                const chatMobile = normalizePhone(chat.id || chat.mobile);
                markMessagesAsRead(chatMobile);
              }}
              onDeleteChat={handleDeleteChat}
              onOpenProfile={(c) => { setProfileData(c); setProfileOpen(true); }}
            />
          </div>
        )}

        {selectedChat && (
          <div className="chat-content">
            <ChatWindow
              chat={selectedChat}
              currentUserMobile={currentUserMobile}
              onSendMessage={handleUpdateSidebar}
              onOpenProfile={(c) => { setProfileData(c); setProfileOpen(true); }}
              onClose={() => setSelectedChat(null)}
            />
          </div>
        )}

        {!selectedChat && !isMobile && (
          <div className="chat-empty-state">
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>

      {!selectedChat && <FloatingChatButton onClick={() => navigate('/contacts')} />}

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} profile={profileData} />
    </div>
  );
}