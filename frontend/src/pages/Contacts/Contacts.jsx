import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig';
import './Contacts.css'

const normalizePhone = (phone) => {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
};

export default function Contacts({ userData, onLogout }) {
  const navigate = useNavigate()
  
  // --- 1. DEFINE USER-SPECIFIC KEYS ---
  const currentUserMobile = normalizePhone(localStorage.getItem("mobile") || userData?.mobile);
  const CONTACTS_KEY = `contacts_${currentUserMobile}`;
  const CHATS_KEY = `chats_${currentUserMobile}`;

  const [contacts, setContacts] = useState(() => {
    try {
      // Fetch only the contacts for the CURRENT logged-in user
      const saved = localStorage.getItem(CONTACTS_KEY);
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '' })
  const [matchedContacts, setMatchedContacts] = useState([])
  const fileInputRef = useRef(null)

  // --- 2. SAVE USING USER-SPECIFIC KEY ---
  useEffect(() => {
    try {
      if (currentUserMobile) {
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
      }
    } catch (e) { 
      console.error("Local storage error:", e);
    }
  }, [contacts, CONTACTS_KEY, currentUserMobile]);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  )

  const handleStartChat = async (contact) => {
    const mobile = normalizePhone(contact.phone || contact.mobile || contact.id);

    // Ensure we are looking in the CURRENT user's chat list
    let chats = JSON.parse(localStorage.getItem(CHATS_KEY)) || [];
    let existingChat = chats.find(c => normalizePhone(c.mobile || c.phone || c.id) === mobile);

    if (existingChat) {
      navigate('/dashboard', {
        state: { selectedChat: existingChat }
      });
      return;
    }

    try {
      // Fetch user data to get current profile image
      const res = await axios.post('/users/lookup', { mobiles: [mobile] });
      const userData = res.data && res.data.length > 0 ? res.data[0] : null;

      const newChat = {
        id: mobile,
        name: contact.name,
        mobile: mobile,
        phone: mobile,
        profileImage: userData?.profileImage || null,
        avatar: contact.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(contact.name)}`,
        lastMessage: '',
        time: 'New'
      };

      chats.push(newChat);
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

      navigate('/dashboard', {
        state: { selectedChat: newChat }
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Fallback to creating chat without profile image
      const newChat = {
        id: mobile,
        name: contact.name,
        mobile: mobile,
        phone: mobile,
        avatar: contact.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(contact.name)}`,
        lastMessage: '',
        time: 'New'
      };

      chats.push(newChat);
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

      navigate('/dashboard', {
        state: { selectedChat: newChat }
      });
    }
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const normalized = normalizePhone(newContact.phone);
      const contact = {
        id: normalized, 
        name: newContact.name,
        phone: normalized,
        mobile: normalized,
        avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(newContact.name)}`
      }
      setContacts(prev => [...prev, contact])
      setNewContact({ name: '', phone: '' })
      setShowAddModal(false)
    }
  }

  const openContactPicker = async () => {
    if (navigator.contacts && navigator.contacts.select) {
      try {
        const props = ['name', 'tel', 'email'];
        const opts = { multiple: true };
        const picked = await navigator.contacts.select(props, opts);
        const list = picked.map(c => ({
          id: normalizePhone(c.tel?.[0]),
          name: Array.isArray(c.name) ? c.name[0] : c.name,
          phone: normalizePhone(c.tel?.[0]),
          email: c.email?.[0],
          avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(Array.isArray(c.name) ? c.name[0] : c.name)}`
        }));
        setContacts(prev => [...prev, ...list]);

        const phones = list.map(x => normalizePhone(x.phone)).filter(p => p.length === 10);
        if (phones.length) {
          axios.post('/api/users/lookup', { phones })
            .then(res => setMatchedContacts(res.data || []))
            .catch(() => { });
        }
      } catch (err) {
        console.warn('Contact picker cancelled', err);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleContactFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    let list = []
    if (text.includes('BEGIN:VCARD')) {
      const vcards = text.split('BEGIN:VCARD').slice(1).map(v => 'BEGIN:VCARD' + v).filter(v => v.includes('END:VCARD'))
      list = vcards.map(vcard => {
        const lines = vcard.split(/\r?\n/)
        let name = ''
        let phone = ''
        lines.forEach(line => {
          if (line.startsWith('FN:')) {
            name = line.substring(3).trim()
          } else if (line.startsWith('TEL;')) {
            const telMatch = line.match(/:(.*)$/)
            if (telMatch) phone = telMatch[1].trim()
          }
        })
        return { id: phone, name, phone, avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name)}` }
      }).filter(c => c.name && c.phone)
    } else {
      const lines = text.split(/\r?\n/).filter(Boolean)
      list = lines.map(l => {
        const parts = l.split(',')
        return { id: parts[0]?.trim(), name: parts[0]?.trim(), phone: parts[1]?.trim(), avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(parts[0]?.trim())}` }
      })
    }
    setContacts(prev => [...prev, ...list]);
    const phones = list.map(x => normalizePhone(x.phone)).filter(p => p.length === 10);
    if (phones.length) {
      axios.post('/api/users/lookup', { phones })
        .then(res => setMatchedContacts(res.data || []))
        .catch(() => { });
    }
    e.target.value = ''
  }

  const handleDeleteContact = (id) => {
    if (!window.confirm("Delete this contact?")) return;
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="contacts-page">
      <div className="contacts-container">
        <div className="contacts-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          </div>
          <h2 className="header-title">Contacts</h2>
          <div className="header-right">
            <button className="import-btn" onClick={openContactPicker}>Import</button>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>+</button>
          </div>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="contacts-list">
          {matchedContacts.length > 0 && (
            <div className="contacts-section">
              <h3>Registered Contacts</h3>
              {matchedContacts.map(c => (
                <div key={c.id} className="contact-item" onClick={() => handleStartChat(c)}>
                  <img src={c.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(c.name)}`} alt={c.name} />
                  <div className="contact-info">
                    <h4>{c.name}</h4>
                    <p>{c.phone}</p>
                  </div>
                  <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteContact(c.id); }}>🗑</button>
                </div>
              ))}
            </div>
          )}
          <div className="contacts-section">
            <h3>All Contacts</h3>
            {filteredContacts.map(c => (
              <div key={c.id} className="contact-item" onClick={() => handleStartChat(c)}>
                <img src={c.avatar} alt={c.name} />
                <div className="contact-info">
                  <h4>{c.name}</h4>
                  <p>{c.phone}</p>
                </div>
                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteContact(c.id); }}>🗑</button>
              </div>
            ))}
            {filteredContacts.length === 0 && <p>No contacts found.</p>}
          </div>
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleContactFile} accept=".vcf,.csv,.txt" style={{ display: 'none' }} />
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add Contact</h2>
            <input
              type="text"
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={newContact.phone}
              onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
            />
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button onClick={handleAddContact}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}