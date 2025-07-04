// backend/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running from backend');
});
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection logic with error handling
io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);
  socket.on('driverLocationUpdate', (data) => {
    try {
      console.log('📍 Driver location:', data);
      io.emit('updateDriverLocation', data);
    } catch (err) {
      console.error('Error handling driverLocationUpdate:', err);
    }
  });
  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected:', socket.id);
  });
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Global error handler for Express
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server (REST + Socket.IO) running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
