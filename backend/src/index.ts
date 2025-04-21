import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import messageRoutes from './routes/message.routes';
import fileRoutes from './routes/file.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a room (for private/group messaging)
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });
  
  // Leave a room
  socket.on('leave', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });
  
  // Handle new message
  socket.on('message', (data) => {
    // Broadcast to the room (conversation)
    io.to(data.conversationId).emit('message', data);
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('typing', {
      user: data.user,
      isTyping: data.isTyping
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server directement en mode développement sans connexion MongoDB
// pour permettre l'accès à l'application sans authentification
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Mode développement - Authentification désactivée`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Server API available at http://localhost:${PORT}/api`);
});

// Code original commenté
// // Import database configuration
// import { connectDB } from './config/database';
// 
// // Connect to MongoDB (either local or in-memory)
// connectDB()
//   .then(() => {
//     // Start server
//     const PORT = process.env.PORT || 5000;
//     server.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//       console.log(`Server API available at http://localhost:${PORT}/api`);
//     });
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION:', err.message);
  console.error(err.stack);
});

export default app;
