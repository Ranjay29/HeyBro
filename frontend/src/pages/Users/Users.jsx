import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { getProfileImageUrl } from '../../utils/getProfileImageUrl';
import './Users.css';

export default function Users({ userData }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/users');
        // expect array of {id,name,profileImage}
        setUsers(res.data || []);
      } catch (err) {
        console.warn('Failed to load users', err);
        // distinguish between unauthenticated and forbidden
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          // clear token & redirect to login
          localStorage.removeItem('token');
          navigate('/');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view contacts.');
          // Keep user on /users so the floating button doesn't bounce them
        } else {
          setError('Unable to load registered users.');
        }
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleClick = (user) => {
    // navigate to chat or show alert
    navigate('/dashboard');
    // TODO: possibly select chat with this user
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1>Contacts</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="users-search">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="users-list">
        {loading && <div className="loading">Loading...</div>}
        {!loading && error && <div className="empty">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="empty">No users found</div>
        )}
        {!loading && !error &&
          filtered.map((u) => (
            <div
              key={u.id}
              className="user-item"
              onClick={() => handleClick(u)}
            >
              <img
                src={getProfileImageUrl(
                  u.profileImage,
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}`
                )}
                alt={u.name}
                className="user-avatar"
              />
              <span className="user-name">{u.name}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
