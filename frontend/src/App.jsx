import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "./api/axiosConfig";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatDashboard from "./pages/ChatDashboard/ChatDashboard.jsx";
import Settings from "./pages/Settings/Settings.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Contacts from "./pages/Contacts/Contacts.jsx";
import CallingDashboard from "./pages/Calling/CallingDashboard.jsx";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

function App() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem('userData');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // try to load user info when token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("/auth/me")
        .then((res) => {
          setUserData(res.data.user || res.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUserData(null);
          navigate("/chat");
        })
        .finally(() => setLoading(false)); // 2. Stop loading when done
    } else {
      setLoading(false); // No token, stop loading
    }
  }, []);

  useEffect(() => {
    if (userData && (pathname === "/" || pathname === "/register")) {
      navigate("/dashboard");
    }
  }, [userData, pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUserData(null);
    navigate("/");
  };

  // callback coming from login component
  const handleLogin = (user) => {
    setUserData(user);
    try {
      localStorage.setItem('userData', JSON.stringify(user));
    } catch { }
    // redirection will be handled below in effect when userData changes
  };

  const normalizePhone = (phone) => {
    if (!phone) return '';
    try {
      const digits = phone.toString().replace(/\D/g, '');
      return digits.length > 10 ? digits.slice(-10) : digits;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (!userData) return;

    const currentUserMobile = normalizePhone(userData?.mobile || localStorage.getItem('mobile'));
    if (!currentUserMobile) return;

    const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/users');
    if (isDashboardRoute) return; // dashboard already handles its own live updates

    const token = localStorage.getItem('token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('https://heybro-backend.onrender.com/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe('/topic/messages', (msg) => {
          try {
            const received = JSON.parse(msg.body);
            const msgReceiver = normalizePhone(received.receiverMobile);
            const msgSender = normalizePhone(received.senderMobile);

            if (msgReceiver !== currentUserMobile) return;

            const storageKey = `chats_${currentUserMobile}`;
            const rawChats = localStorage.getItem(storageKey);
            const parsedChats = rawChats ? JSON.parse(rawChats) : [];
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let found = false;
            const updatedChats = parsedChats.map(chat => {
              const chatMobile = normalizePhone(chat.id || chat.mobile || chat.phone);
              if (chatMobile === msgSender) {
                found = true;
                return {
                  ...chat,
                  lastMessage: received.content,
                  timestamp: now,
                  unread: (chat.unread || 0) + 1,
                };
              }
              return chat;
            });

            if (!found) {
              updatedChats.unshift({
                id: msgSender,
                mobile: msgSender,
                name: msgSender,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(msgSender)}`,
                lastMessage: received.content,
                timestamp: now,
                unread: 1,
              });
            }

            localStorage.setItem(storageKey, JSON.stringify(updatedChats));
            window.dispatchEvent(new CustomEvent('chatStorageUpdate', {
              detail: { user: currentUserMobile }
            }));
          } catch (err) {
            console.error('Global message listener error:', err);
          }
        });
      }
    });

    client.activate();
    return () => {
      if (client.active) client.deactivate();
    };
  }, [userData, pathname]);

  if (loading) return <div>Loading...</div>;
  return (
      <Routes>
        <Route
          path="/"
          element={
            userData || localStorage.getItem("token")
              ? <Navigate to="/dashboard" />
              : <Login onLogin={handleLogin} userData={userData} />
          }

        />
        <Route path="/register" element={<Register />} />

        {/* protected routes */}
        <Route
          path="/dashboard" element={userData ? (<ChatDashboard userData={userData}
            onLogout={handleLogout} />
          ) : (
            <Navigate to="/" />
          )
          }
        />
        <Route
          path="/settings"
          element={
            userData ? (
              <Settings userData={userData} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/contacts"
          element={
            userData ? (
              <Contacts userData={userData} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        {/* `/users` intentionally shows the dashboard with the menu open; the
            standalone Users component is no longer used. */}
        <Route
          path="/users"
          element={
            userData ? (
              <ChatDashboard userData={userData} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            userData ? (
              <Profile userData={userData} setUserData={setUserData} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/calling" element={<CallingDashboard />} />
        {/* fallback */}
        <Route path="*" element={userData ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />

      </Routes>
  );
}

export default App;