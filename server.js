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

  // ✅ Join a topic room (not group anymore)
  socket.on("join_topic", ({ topicId }) => {
    if (topicId) {
      socket.join(topicId);
      console.log(`✅ Socket ${socket.id} joined topic ${topicId}`);
    }
  });

  // ✅ Leave a topic room
  socket.on("leave_topic", ({ topicId }) => {
    if (topicId) {
      socket.leave(topicId);
      console.log(`🚪 Socket ${socket.id} left topic ${topicId}`);
    }
  });

  // ✅ Send group message inside a topic
  socket.on("send_group_message", async (newMessage) => {
    console.log("📩 Received group message:", newMessage);

    const { groupId, topicId, senderId, senderModel, text } = newMessage;

    if (!groupId || !topicId || !senderId || !text) {
      return console.error("❌ Missing message fields");
    }

    try {
      const saved = await groupTopicMessageModel.create({
        groupId,
        topicId,
        senderId,
        senderModel,
        text,
      });

      // Emit to topic room only
      io.to(topicId.toString()).emit("new_group_message", saved);
    } catch (err) {
      console.error("❌ Failed to save group message:", err.message);
    }
  });

  // ✅ Handle all modular socket handlers
  registerSocketHandlers(io, socket, connectedUsers);

  // ✅ On user disconnect
  socket.on('disconnect', () => {
    for (let [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('❌ Socket disconnected:', socket.id);
  });

  // ✅ Cleanup all rooms
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
