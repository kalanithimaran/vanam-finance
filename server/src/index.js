require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const investmentRoutes = require('./routes/investment');
const loansRoutes = require('./routes/loans');
const cropPlansRoutes = require('./routes/cropPlans');
const targetsRoutes = require('./routes/targets');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(require('cookie-parser')());

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/investment-plan', investmentRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/crop-plans', cropPlansRoutes);
app.use('/api/targets', targetsRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Vanam API is running! 🚀');
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Authenticate socket
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      const room = `household_${decoded.householdId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    } catch (e) {
      console.log('Socket auth error:', e.message);
    }
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
