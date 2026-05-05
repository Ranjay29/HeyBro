import { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { getProfileImageUrl } from '../../utils/getProfileImageUrl'
import './ProfileModal.css'

export default function ProfileModal({ open, onClose, profile }) {
  const [freshProfileData, setFreshProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && profile?.mobile) {
      setLoading(true);
      // Fetch fresh user data to get current profile image
      axios.post('/users/lookup', { mobiles: [profile.mobile] })
        .then(response => {
          if (response.data && response.data.length > 0) {
            setFreshProfileData(response.data[0]);
          }
        })
        .catch(error => {
          console.error('Failed to fetch fresh profile data:', error);
          setFreshProfileData(profile); // fallback to passed profile
        })
        .finally(() => setLoading(false));
    } else if (!open) {
      setFreshProfileData(null);
    }
  }, [open, profile?.mobile]);

  const displayProfile = freshProfileData || profile;

  if (!open || !profile) return null

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose}>✕</button>
        <div className="pm-header">
          <img
            src={getProfileImageUrl(
              displayProfile?.avatar || displayProfile?.profileImage,
              `https://ui-avatars.com/api/?name=${encodeURIComponent(displayProfile?.name || 'User')}`
            )}
            alt={displayProfile?.name}
            />
          <div className="pm-user-info">
            <h2>{displayProfile?.name}</h2>
            <p className="pm-username">{displayProfile?.username || ''}</p>
          </div>
        </div>

        <div className="pm-details">
          {displayProfile?.email && <div><strong>Email:</strong> {displayProfile.email}</div>}
          {displayProfile?.mobile && <div><strong>Mobile:</strong> {displayProfile.mobile}</div>}
          {displayProfile?.location && <div><strong>Location:</strong> {displayProfile.location}</div>}
        </div>

        <div className="pm-actions">
          <button className="share-btn">Share Profile</button>
          <button className="chat-btn">Message</button>
        </div>
      </div>
    </div>
  )
}
