import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [sharedWith, setSharedWith] = useState([]);
  const { user, base } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${base}/api/users/all?currentUserId=${user?.id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to fetch users');
        } else {
          setUsers(data);
        }
      } catch {
        setError('Network error. Please try again.');
      }
    };
    if (user?.id) fetchUsers();
  }, [user]);

  const handleShareLocation = async (toUserId) => {
    setError('');
    try {
      const res = await fetch(`${base}/api/users/share-location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromUserId: user.id, toUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to share location');
      } else {
        setSharedWith(prev => [...prev, toUserId]);
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const handleStopSharing = async (toUserId) => {
    setError('');
    try {
      const res = await fetch(`${base}/api/users/stop-sharing-location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromUserId: user.id, toUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to stop sharing location');
      } else {
        setSharedWith(prev => prev.filter(id => id !== toUserId));
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>Other Users</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {users.map(u => (
          <div key={u._id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 250 }}>
            <div style={{ fontWeight: 'bold', fontSize: 18 }}>{u.name}</div>
            <div style={{ color: '#555', marginBottom: 8 }}>{u.email}</div>
            {u.canAccess && u.canAccess.includes(user.id) && (
              <button onClick={() => navigate(`/${u._id}`)} style={{ padding: 8, width: '48%', marginRight: '4%' }}>See Location</button>
            )}
            <button
              style={{ padding: 8, width: '48%' }}
              onClick={() =>
                sharedWith.includes(u._id)
                  ? handleStopSharing(u._id)
                  : handleShareLocation(u._id)
              }
            >
              {sharedWith.includes(u._id) ? 'Stop Sharing' : 'Share Location'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPage; 