import './FloatingChatButton.css'

export default function FloatingChatButton({ onClick, isHidden = false }) {
  if (isHidden) return null;

  return (
    <div className="floating-chat-container">
      <button 
        className="floating-chat-btn"
        onClick={onClick}
        title="Contacts"
      >
        ✉️
      </button>
    </div>
  );
}
