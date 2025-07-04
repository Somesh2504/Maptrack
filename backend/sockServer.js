// backend/socketServer.js
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify your frontend URL
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection logic
io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);

  // Driver location update listener
  socket.on('driverLocationUpdate', (data) => {
    console.log('📍 Driver location:', data);
    // Forward to all connected clients (or use room if needed)
    io.emit('updateDriverLocation', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected:', socket.id);
  });
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running at http://localhost:${PORT}`);
});
