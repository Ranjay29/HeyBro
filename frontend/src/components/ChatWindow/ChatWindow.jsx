import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatWindow.css';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { FaPhone, FaVideo } from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
import { IoClose, IoCheckmark, IoCheckmarkDone, IoDownloadOutline } from "react-icons/io5"; // Added Download Icon
import axios from "../../api/axiosConfig";

export default function ChatWindow({ chat, onSendMessage, onOpenProfile, onClose }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [liveMessages, setLiveMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [isHighlight, setIsHighlight] = useState(false);
  const messagesEndRef = useRef(null);
  const onSendMessageRef = useRef(onSendMessage);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { onSendMessageRef.current = onSendMessage; }, [onSendMessage]);

  const VITE_API_URL = import.meta.env.VITE_API_URL || "https://heybro-backend.onrender.com/api" || "http://localhost:8080/api";
  const backendOrigin = VITE_API_URL.replace(/\/api\/?$/, '');
  const audioBase = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
  const sendAudio = useRef(new Audio(`${audioBase}/sounds/send.mp3`));
  const receiveAudio = useRef(new Audio(`${audioBase}/sounds/receive.mp3`));

  const normalizePhone = useCallback((phone) => {
    if (!phone) return '';
    const digits = phone.toString().replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }, []);

  const getMe = useCallback(() => normalizePhone(localStorage.getItem("mobile")), [normalizePhone]);

  useEffect(() => {
    if (chat) {
      setIsHighlight(true);
      const timer = setTimeout(() => setIsHighlight(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [chat?.id, chat?.mobile]);

  const playChatSound = (audioRef) => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('app_settings') || '{}');
      if (savedSettings.soundEnabled !== false) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
      }
    } catch (e) { console.warn("Audio failed", e); }
  };

  // --- NEW: FORCED DOWNLOAD LOGIC ---
  const handleDownload = async (url, fileName) => {
    try {
      const fileUrl = url.startsWith('http') ? url : `${backendOrigin}${url}`;
      const response = await fetch(fileUrl);

      // ✅ Check if the response is actually okay
      if (!response.ok) throw new Error("File not found on server");

      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Fetched blob is empty");

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // If the fetch fails, try opening in a new tab as a last resort
      const fileUrl = url.startsWith('http') ? url : `${backendOrigin}${url}`;
      window.open(fileUrl, '_blank');
    }
  };

  // Fetch History
  useEffect(() => {
    if (!chat) return;
    let isMounted = true;
    const currentUser = getMe();
    const receiverMobile = normalizePhone(chat.mobile || chat.phone || chat.id);

    const fetchHistory = async () => {
      
      try {
        const res = await axios.get(`/messages/${currentUser}/${receiverMobile}`);
        if (isMounted) {
          const formatted = res.data.map(msg => {
            const isFile = msg.messageType === 'file';
            return {
              id: msg.id || Math.random(),
              text: isFile ? "" : msg.content,
              isSender: normalizePhone(msg.senderMobile) === currentUser,
              timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: msg.status || "seen",
              type: isFile ? 'file' : 'text',
              fileName: msg.fileName,
              fileUrl: isFile ? msg.content : null
            };
          });
          setLiveMessages(formatted);
        }
      } catch (err) { console.error("History error", err); }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [chat?.id, chat?.mobile, getMe, normalizePhone]);

  // WebSocket
  useEffect(() => {
    if (!chat) return;
    const currentUser = getMe();
    const receiverMobile = normalizePhone(chat.mobile || chat.phone || chat.id);
    const token = localStorage.getItem("token");

    const client = new Client({
      webSocketFactory: () => new SockJS(`${backendOrigin}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe("/topic/messages", (msg) => {
          const received = JSON.parse(msg.body);
          const msgSender = normalizePhone(received.senderMobile);
          const msgReceiver = normalizePhone(received.receiverMobile);

          // ONLY add to state if the sender is NOT the current user
          // This prevents the "double bubble" for the sender
          if (msgReceiver === currentUser && msgSender === receiverMobile && msgSender !== currentUser) {
            playChatSound(receiveAudio);
            const isFile = received.messageType === 'file';
            const fileLabel = `📁 ${received.fileName || 'File'}`;

            setLiveMessages(prev => [...prev, {
              id: Date.now(),
              text: isFile ? "" : received.content,
              isSender: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: "delivered",
              type: isFile ? 'file' : 'text',
              fileName: received.fileName,
            }]);
            onSendMessageRef.current(isFile ? fileLabel : received.content, msgSender, false);
          }
        });
      },
    });
    client.activate();
    setStompClient(client);
    return () => { if (client.active) client.deactivate(); };
  }, [chat?.id, chat?.mobile, getMe, normalizePhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages]);

  const handleSendMessage = () => {
    if (!message.trim() || !stompClient?.connected) return;
    const currentUser = getMe();
    const receiverMobile = normalizePhone(chat.mobile || chat.phone || chat.id);
    const messageObj = {
      senderMobile: currentUser,
      receiverMobile,
      content: message.trim(),
      messageType: 'text',
      Status: 'SENT',
      timestamp: new Date().toISOString()
    };

    setLiveMessages(prev => [...prev, {
      id: Date.now(),
      text: message.trim(),
      isSender: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "SENT",
      type: 'text'
    }]);

    playChatSound(sendAudio);
    stompClient.publish({ destination: "/app/chat", body: JSON.stringify(messageObj) });
    onSendMessageRef.current(message.trim(), receiverMobile, true);
    setMessage('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!stompClient || !stompClient.connected) {
      alert("Chat server not connected. Please wait or refresh.");
      return;
    }
    const currentUser = getMe();
    const receiverMobile = normalizePhone(chat.mobile || chat.phone || chat.id);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderMobile', currentUser);
    formData.append('receiverMobile', receiverMobile);

    try {
      const res = await axios.post('/messages/upload', formData);
      const fileMessage = res.data;
      const fileUrl = fileMessage.content;
      const fileLabel = `📁 ${fileMessage.fileName || file.name}`;

      const localMsg = {
        id: Date.now(),
        text: "",
        isSender: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'SENT',
        type: 'file',
        fileName: fileMessage.fileName || file.name,
      };

      setLiveMessages(prev => [...prev, localMsg]);
      playChatSound(sendAudio);
      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify({
          senderMobile: currentUser,
          receiverMobile,
          content: fileMessage,
          messageType: 'file',
          fileName: fileMessage.fileName || file.name,
          timestamp: new Date().toISOString()
        })
      });
      if (onSendMessageRef.current) {
        onSendMessageRef.current(fileLabel, receiverMobile, true);
      }

      console.log("File shared successfully");
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err.message);
      alert("Failed to upload file. Check console for details.");
    } finally {
      e.target.value = ''; // Reset input so same file can be selected again
    }
  };

  return (
    <div className={`chat-window ${isHighlight ? 'window-highlight' : ''}`}>
      <div className="chat-window-header">
        <div className="chat-header-info" onClick={() => onOpenProfile(chat)}>
          <img src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}`} alt="avatar" />
          <div>
            <h2 className="chat-header-name">{chat.name}</h2>
            <p className="chat-header-status">Online</p>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn" onClick={() => navigate('/calling', { state: { callData: { ...chat, type: 'audio' } } })}><FaPhone /></button>
          <button className="action-btn" onClick={() => navigate('/calling', { state: { callData: { ...chat, type: 'video' } } })}><FaVideo /></button>
          <button className="action-btn" onClick={onClose}><IoClose /></button>
        </div>
      </div>

      <div className="messages-container">
        {liveMessages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isSender ? 'sent' : 'received'}`}>
            <div className="message-bubble">
              {msg.type === 'file' ? (
                <div className="file-message">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <div className="file-name">{msg.fileName || "Attachment"}</div>
                    <button
                      className="file-download-btn"
                      onClick={() => handleDownload(msg.fileUrl, msg.fileName)}
                    >
                      <IoDownloadOutline /> Download
                    </button>
                  </div>
                </div>
              ) : (
                // Only show the p tag if msg.text actually contains something
                msg.text && <p className="message-text">{msg.text}</p>
              )}

              <div className="message-meta">
                <span className="message-time">{msg.timestamp}</span>
                {msg.isSender && (
                  <span className={`tick ${msg.status?.toLowerCase()}`}>
                    {msg.status?.toLowerCase() === "sent" ? <IoCheckmark /> : <IoCheckmarkDone className={msg.status === "seen" ? "blue-tick" : ""} />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-area">
        <div className="input-actions">
          <button className="input-action-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
          {showEmojiPicker && <div className="emoji-picker-popup"><EmojiPicker onEmojiClick={(e) => setMessage(p => p + e.emoji)} /></div>}
          <button className="input-action-btn" onClick={() => fileInputRef.current.click()}>📁</button>
          <input ref={fileInputRef} type="file" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
        <input
          type="text"
          className="message-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className={`send-btn ${message.trim() ? 'active' : ''}`} onClick={handleSendMessage}>➤</button>
      </div>
    </div>
  );
}