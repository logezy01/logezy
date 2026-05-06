const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/listings', require('./src/routes/listings'));
app.use('/api/chat', require('./src/routes/chat'));
app.use('/api/admin', require('./src/routes/admin'));

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Logezy API fonctionne !',
    version: '1.0.0',
    routes: ['/api/auth', '/api/listings', '/api/chat', '/api/admin']
  });
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`✅ Connecté : ${socket.id}`);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Déconnecté : ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur Logezy démarré sur le port ${PORT}`);
  console.log(`📡 http://localhost:${PORT}`);
});