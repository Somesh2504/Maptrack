import { io } from 'socket.io-client';

const socket = io('https://maptrack-959v.onrender.com', {
  autoConnect: false, // Let the app control when to connect
});

export default socket;
