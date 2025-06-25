import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';
import http from 'http';
import { Server } from 'socket.io';
import registerSocketHandlers from './sockets/index.js';
import groupTopicMessageModel from './models/Group/groupTopicMessageModel.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 🧩 Normal Routes
import modelRoutes from './routes/modelRoutes.js';
import agencyRoutes from './routes/agencyRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import agencyToModelMessageRoutes from './routes/message/agencyToModelMessageRoutes.js';
import topicRoutes from './routes/message/topicRoutes.js';
import groupTopicMessageRoutes from './routes/message/groupTopicMessageRoutes.js';
app.use('/api/v1/model', modelRoutes);
app.use('/api/v1/agency', agencyRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/messages/agency-to-model', agencyToModelMessageRoutes);
app.use('/api/v1/topic', topicRoutes);
app.use('/api/v1/messages/group', groupTopicMessageRoutes);

// 🧠 Create HTTP Server
const server = http.createServer(app);

// ⚡ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:4000',
        'https://modelsuite-frontend.vercel.app'
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

// 🌐 In-memory user tracking
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New socket connected:', socket.id);

  // ✅ Register user
  socket.on('register', ({ userId }) => {
    connectedUsers.set(userId, socket.id);
    console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
  });

  socket.on("join_room", ({ room }) => {
  socket.join(room);
  console.log(`✅ Socket ${socket.id} joined room ${room}`);
});

socket.on("leave_room", ({ room }) => {
  socket.leave(room);
  console.log(`🚪 Socket ${socket.id} left room ${room}`);
});

socket.on("send_group_message", async (newMessage) => {
  console.log("📩 Received group message:", newMessage)
  // Save to DB
  try {
    const saved = await groupTopicMessageModel.create({
      groupId: newMessage.groupId,
      senderId: newMessage.senderId,
      senderModel: newMessage.senderModel,
      text: newMessage.text,
    });

    io.to(newMessage.groupId).emit("new_group_message", saved);
  } catch (err) {
    console.error("❌ Failed to save group message:", err.message);
  }
});

  // ✅ Handle all modular socket handlers
  registerSocketHandlers(io, socket, connectedUsers);

  // ✅ Handle disconnect
  socket.on('disconnect', () => {
    for (let [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('❌ Socket disconnected:', socket.id);
  });

  socket.on('disconnecting', () => {
  for (let room of socket.rooms) {
    socket.leave(room);
  }
});
});

// 🚀 Start the server
server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
