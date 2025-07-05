// frontend/src/components/CabTracker.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AppContext } from './context/AppContext';

const Tracker = () => {
  const { id: trackedUserId } = useParams();
  const { socket } = useContext(AppContext);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    console.log('Tracker: Socket connected?', socket?.connected);
    console.log('Tracker: Tracking user ID:', trackedUserId);
    
    if (!socket) {
      console.log('Tracker: No socket available');
      return;
    }
    
    const handler = (data) => {
      console.log('Tracker: Received location update:', data);
      // Accept both driverId and userId for flexibility
      if (data.userId === trackedUserId || data.driverId === trackedUserId) {
        console.log('Tracker: Setting location for user:', trackedUserId);
        setLocation({ lat: data.lat, lng: data.lng });
      } else {
        console.log('Tracker: Location update not for this user. Expected:', trackedUserId, 'Got:', data.userId || data.driverId);
      }
    };
    
    socket.on('updateDriverLocation', handler);
    return () => socket.off('updateDriverLocation', handler);
  }, [socket, trackedUserId]);

  if (!location) return <div style={{ padding: '2rem', textAlign: 'center' }}>Waiting for live location...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2 style={{ marginBottom: 16 }}>Live Location Tracker</h2>
      <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '400px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.lat, location.lng]}>
          <Popup>User's Live Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Tracker;
