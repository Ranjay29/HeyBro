import { useNavigate } from 'react-router-dom'
import './Header.css'

export default function Header({ userData, onLogout }) {
  const navigate = useNavigate()

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="app-name">HeyBro</h1>
      </div>

      <div className="header-right">
        <button 
          className="profile-icon"
          onClick={() => navigate('/profile')}
          title="Profile"
        >
          <img
            src={
              userData?.profileImage ||
              "https://ui-avatars.com/api/?name=" + (userData?.name || 'User')
            }
            alt="Profile"
            className="profile-pic"
          />
        </button>
      </div>
    </div>
  )
}
