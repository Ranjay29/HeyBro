import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaPhoneSlash, FaVideo } from 'react-icons/fa';
import './CallingDashboard.css';

export default function CallingDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [callStatus, setCallStatus] = useState("Connecting...");
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const callData = location.state?.callData; 

  if (!callData) return null;

  // Call Timer Logic
  useEffect(() => {
    let interval;
    const timeout = setTimeout(() => {
      setCallStatus("00:00");
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }, 2000); // Simulate connection delay

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus("Call Ended");
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  return (
    <div className="calling-screen">
      <div className="calling-overlay">
        <div className="calling-container">
          <div className="caller-info">
            <div className="caller-avatar-wrapper">
              <img 
                src={callData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(callData.name)}&size=200`} 
                alt="Caller" 
                className="caller-avatar"
              />
              <div className="pulse-ring"></div>
            </div>
            <h1 className="caller-name">{callData.name}</h1>
            <p className="call-status">
              {timer > 0 ? formatTime(timer) : callStatus}
            </p>
          </div>

          <div className="call-actions-grid">
            <button 
              className={`call-btn secondary ${isMuted ? 'active' : ''}`} 
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </button>

            <button 
              className={`call-btn secondary ${isSpeaker ? 'active' : ''}`} 
              onClick={() => setIsSpeaker(!isSpeaker)}
            >
              <FaVolumeUp />
              <span>Speaker</span>
            </button>

            <button className="call-btn secondary">
              <FaVideo />
              <span>Video</span>
            </button>

            <button className="call-btn end-call" onClick={handleEndCall}>
              <FaPhoneSlash />
              <span>End</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}