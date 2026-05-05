import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'
import './Settings.css'

export default function Settings({ userData, onLogout }) {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    messagePreview: true,
    onlineStatus: true
  })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const toggleSetting = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    })
  }

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/delete-account') // backend endpoint

      // clear local data
      localStorage.removeItem('token')
      localStorage.removeItem('mobile')

      // logout + redirect
      onLogout()
      navigate('/')

    } catch (err) {
      console.error("Delete failed:", err)
      alert("Failed to delete account")
    }
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          ← Back
        </button>
        <h1>Settings</h1>
        <div className="header-spacer"></div>
        <button className="help-btn" onClick={() => navigate('/help')} title="Help">
        🎧
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <div className="settings-section">
            <h2>Notifications</h2>
            <div className="setting-item">
              <div className="setting-info">
                <p className="setting-label">Enable Notifications</p>
                <p className="setting-description">Receive notifications for new messages</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => toggleSetting('notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <p className="setting-label">Sound Notifications</p>
                <p className="setting-description">Play sound for incoming messages</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={() => toggleSetting('soundEnabled')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h2>Privacy & Display</h2>
            <div className="setting-item">
              <div className="setting-info">
                <p className="setting-label">Online Status</p>
                <p className="setting-description">Show when you're online</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.onlineStatus}
                  onChange={() => toggleSetting('onlineStatus')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <p className="setting-label">Message Preview</p>
                <p className="setting-description">Show message preview in notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.messagePreview}
                  onChange={() => toggleSetting('messagePreview')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h2>Account</h2>
            <div className="setting-item">
              <div className="setting-info">
                <p className="setting-label">Current User</p>
                <p className="setting-email">{userData.email}</p>
                <p className="setting-email">{userData.mobile}</p>
              </div>
            </div>

            <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
              Logout
            </button>
            <button className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </button>
          </div>

          <div className="settings-section app-info">
            <h3>HeyBro v1.0.0</h3>
            <p>Professional Chat Application</p>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-dialog">
            <h2>Logout?</h2>
            <p>Are you sure you want to logout from HeyBro?</p>
            <div className="confirm-buttons">
              <button className="confirm-btn" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <h2>Delete Account?</h2>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="confirm-buttons">
              <button className="confirm-btn" onClick={handleDeleteAccount}>
                Yes, Delete
              </button>
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
