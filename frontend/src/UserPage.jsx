import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [sharedWithUsers, setSharedWithUsers] = useState([]); // user IDs we are sharing with
  const { user, base, socket } = useContext(AppContext);
  const navigate = useNavigate();
  const geoWatchId = useRef(null);

  // Helper: are we sharing with at least one user?
  const isSharing = sharedWithUsers.length > 0;

  // Start/stop geolocation watcher based on sharing state
  useEffect(() => {
    console.log('UserPage: isSharing:', isSharing, 'socket connected:', socket?.connected, 'user:', user?.id);
    console.log('UserPage: sharedWithUsers:', sharedWithUsers);
    
    if (isSharing && socket && user) {
      console.log('UserPage: Starting location sharing...');
      geoWatchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          console.log('UserPage: Got position:', pos.coords);
          // Emit location for all users we are sharing with
          sharedWithUsers.forEach((toUserId) => {
            const locationData = {
              userId: user.id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              toUserId, // Optionally include for backend filtering
            };
            console.log('UserPage: Emitting location:', locationData);
            socket.emit('driverLocationUpdate', locationData);
          });
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    } else if (geoWatchId.current !== null) {
      console.log('UserPage: Stopping location sharing...');
      navigator.geolocation.clearWatch(geoWatchId.current);
      geoWatchId.current = null;
    }
    return () => {
      if (geoWatchId.current !== null) {
        navigator.geolocation.clearWatch(geoWatchId.current);
        geoWatchId.current = null;
      }
    };
  }, [isSharing, socket, user, sharedWithUsers]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${base}/api/users/all?currentUserId=${user?.id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to fetch users');
        } else {
          console.log('Fetched users:', data);
          setUsers(data);
        }
      } catch {
        setError('Network error. Please try again.');
      }
    };
    if (user?.id) fetchUsers();
  }, [user]);

  // Update sharedWithUsers state based on users data
  useEffect(() => {
    // Find all users where our user.id is in their canAccess array
    const sharingWith = users.filter(u => u.canAccess && u.canAccess.map(String).includes(String(user.id))).map(u => u._id);
    setSharedWithUsers(sharingWith);
  }, [users, user]);

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
        setSharedWithUsers(prev => [...prev, toUserId]);
        // Refetch users to update UI
        const fetchUsers = async () => {
          try {
            const res = await fetch(`${base}/api/users/all?currentUserId=${user?.id}`);
            const data = await res.json();
            if (res.ok) {
              setUsers(data);
            }
          } catch {
            // Silently fail for refetch
          }
        };
        fetchUsers();
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
        setSharedWithUsers(prev => prev.filter(id => id !== toUserId));
        // Refetch users to update UI
        const fetchUsers = async () => {
          try {
            const res = await fetch(`${base}/api/users/all?currentUserId=${user?.id}`);
            const data = await res.json();
            if (res.ok) {
              setUsers(data);
            }
          } catch {
            // Silently fail for refetch
          }
        };
        fetchUsers();
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };
  console.log(users,"*********",user)
  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>Other Users</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {users.map(u => (
          <div key={u._id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 250 }}>
            <div style={{ fontWeight: 'bold', fontSize: 18 }}>{u.name}</div>
            <div style={{ color: '#555', marginBottom: 8 }}>{u.email}</div>
            {/* See Location button if current user is in u.sharedWith */}
           { console.log(u.sharedWith,"*********",user.id)}
            {u.sharedWith && u.sharedWith.map(String).includes(String(user.id)) && (
              <button onClick={() => navigate(`/${u._id}`)} style={{ padding: 8, width: '100%', marginBottom: 8 }}>See Location</button>
            )}
            {/* Stop Sharing if current user is in u.canAccess, else Share Location */}
            {u.canAccess && u.canAccess.map(String).includes(String(user.id)) ? (
              <button
                style={{ padding: 8, width: '100%' }}
                onClick={() => handleStopSharing(u._id)}
              >
                Stop Sharing
              </button>
            ) : (
              <button
                style={{ padding: 8, width: '100%' }}
                onClick={() => handleShareLocation(u._id)}
              >
                Share Location
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPage; 