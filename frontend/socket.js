import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  autoConnect: false, // Let the app control when to connect
});

export default socket;
