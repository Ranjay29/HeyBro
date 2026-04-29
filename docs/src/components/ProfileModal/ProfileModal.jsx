import './ProfileModal.css'

export default function ProfileModal({ open, onClose, profile }) {
  if (!open || !profile) return null

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose}>✕</button>
        <div className="pm-header">
          <img
            src={profile.avatar || profile.profileImage}
            alt={profile.name}
            />
          <div className="pm-user-info">
            <h2>{profile.name}</h2>
            <p className="pm-username">{profile.username || ''}</p>
          </div>
        </div>

        <div className="pm-details">
          {profile.email && <div><strong>Email:</strong> {profile.email}</div>}
          {profile.mobile && <div><strong>Mobile:</strong> {profile.mobile}</div>}
          {profile.location && <div><strong>Location:</strong> {profile.location}</div>}
        </div>

        <div className="pm-actions">
          <button className="share-btn">Share Profile</button>
          <button className="chat-btn">Message</button>
        </div>
      </div>
    </div>
  )
}
