import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import './Profile.css'

export default function Profile({ userData, setUserData, onLogout }) {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')

  // Initialize with empty strings so the inputs don't switch from uncontrolled to controlled
  const [formData, setFormData] = useState(userData || {
    name: '',
    email: '',
    mobile: '',
    profileImage: ''
  });

  // Add this useEffect to sync formData whenever userData (from props or fetch) updates
  useEffect(() => {
    if (userData) {
      setFormData(userData);
    }
  }, [userData]);

  // Fetch latest user data from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/auth/me");
        const data = response.data;

        // 1. Update React state (RAM handles large strings fine)
        setUserData(data);

        // 2. Remove the image before saving to localStorage
        const { profileImage, ...lightweightData } = data;
        localStorage.setItem('userData', JSON.stringify(lightweightData));

      } catch (err) {
        if (err.name === 'QuotaExceededError') {
          console.error("Local storage full! Image was too big for cache.");
        }
      }
    };

    // Check if we have data in localStorage to show immediately
    const localData = localStorage.getItem('userData');
    if (localData) {
      setUserData(JSON.parse(localData));
      setFormData(JSON.parse(localData));
    }

    // Only fetch if we have a token and NO user data yet
    if (localStorage.getItem("token")) {
      fetchUser();
    }
  }, [setUserData]);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1124 * 1124) {
        alert("Image is too large. Please choose an image under 5MB.");
        return;
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({
          ...formData,
          profileImage: event.target.result
        });
      };
      reader.readAsDataURL(file)
    }
  };

  // Inside your fetchUser or handleSave function
  const handleSave = async () => {
    try {
      const response = await axios.put("/users/update-profile", formData);

      // This updates the screen immediately
      setUserData(response.data);

      // This saves to the browser CACHE (without the heavy image)
      const { profileImage, ...lightData } = response.data;
      localStorage.setItem('userData', JSON.stringify(lightData));

      setIsEditing(false);
      setMessage("Profile updated perfectly!");
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1>Profile Settings</h1>
        <button className="settings-icon" onClick={() => navigate('/settings')} title="Settings">
          ⚙️
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-image-section">
            <img src={userData.profileImage || "https://ui-avatars.com/api/?name=" + (userData.name || 'User')} alt={userData.name || 'User'} className="profile-image" />
            {isEditing && (
              <label className="image-upload-label">
                <span className="camera-icon">📷</span>
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
            )}
          </div>

          <div className="profile-info">
            {!isEditing ? (
              <>
                <div className="info-field">
                  <label>Name</label>
                  <p>{formData.name}</p>
                </div>
                <div className="info-field">
                  <label>Email</label>
                  <p>{formData.email}</p>
                </div>
                <div className="info-field">
                  <label>Mobile Number</label>
                  <p>{formData.mobile}</p>
                </div>

                <div className="profile-action-row">
                  <button className="share-btn" onClick={() => navigator.share ? navigator.share({ title: formData.name, text: 'Check this profile', url: window.location.href }).catch(() => { }) : alert('Share not supported')}>Share Profile</button>
                  <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
                </div>

                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  ✎ Edit Profile
                </button>
                <button className="logout-btn" onClick={() => {
                  if (window.confirm('Logout now?')) {
                    onLogout && onLogout();
                  }
                }}>Logout</button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div className="button-group">
                  <button className="save-btn" onClick={handleSave}>
                    💾 Save Changes
                  </button>
                  <button className="cancel-btn" onClick={() => {
                    setIsEditing(false)
                    setFormData(userData)
                  }}>
                    ✕ Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          {message && <div className="success-message">{message}</div>}
        </div>
      </div>
    </div>
  )
}
