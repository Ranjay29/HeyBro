import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Cropper from 'react-easy-crop'
import axios from '../../api/axiosConfig'
import './Profile.css'

export default function Profile({ userData, setUserData, onLogout }) {
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Initialize with empty strings so the inputs don't switch from uncontrolled to controlled
  const [formData, setFormData] = useState(userData || {
    name: '',
    email: '',
    mobile: '',
    profileImage: ''
  });

  const [showPreview, setShowPreview] = useState(false)

  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  useEffect(() => {
    if (userData) {
      setFormData(userData);
    }
  }, [userData]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
        setSaveSuccess(false)
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch latest user data from backend
  useEffect(() => {
    if (!userData && localStorage.getItem("token")) {
      const fetchUser = async () => {
        try {
          const response = await axios.get("/auth/me");
          setUserData(response.data);
        } catch (err) {
          console.error("Fetch error:", err);
        }
      };

      fetchUser();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please choose an image under 5MB.");
        return;
      }

      const reader = new FileReader()
      reader.onload = () => setImageSrc(reader.result)
      reader.readAsDataURL(file)
    }
  };

  const getCroppedImg = async (imageSrc, crop) => {
    const image = new Image()
    image.src = imageSrc

    await new Promise((resolve) => (image.onload = resolve))

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    )

    return canvas.toDataURL('image/jpeg')
  }

  const handleCropSave = async () => {
    const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);

    setFormData(prev => ({
      ...prev,
      profileImage: cropped
    }));

    setUserData(prev => ({
      ...prev,
      profileImage: cropped
    }));

    setImageSrc(null);
  };

  const handleSave = async () => {
    try {
      setUserData(formData);

      const response = await axios.put("/users/update-profile", formData);
      setUserData(response.data);
      const { profileImage, ...lightData } = response.data;
      localStorage.setItem('userData', JSON.stringify(lightData));

      setIsEditing(false);
      setSaveSuccess(true);
      setMessage("Profile updated perfectly!");
    } catch (err) {
      setSaveSuccess(false);
      setMessage(err.response?.data || "Failed to update profile");
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
            <img
              src={
                formData.profileImage || userData.profileImage || "https://ui-avatars.com/api/?name=" + (userData.name || 'User')}
              alt={userData.name || 'User'}
              className="profile-image"
              onClick={() => setShowPreview(true)}
            />
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

                <button className="edit-btn" onClick={() => {
                  setIsEditing(true);
                  setMessage('');
                  setSaveSuccess(false);
                }}>
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

          {message && (
            <div className={`status-message ${saveSuccess ? 'success' : 'error'}`}>
              {saveSuccess ? '✔️ ' : '⚠️ '}{message}
            </div>
          )}

          {showPreview && (
            <div className="modal" onClick={() => setShowPreview(false)}>
              <button className="close-preview" onClick={() => setShowPreview(false)}>✕</button>
              <img src={formData.profileImage} className="preview-image" />
            </div>
          )}

          {imageSrc && (
            <div className="crop-modal">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
              />
              <button onClick={handleCropSave}>Save Crop</button>
              
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
