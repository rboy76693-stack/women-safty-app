require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.set('io', io);

// Try MongoDB, fall back to demo mode if no URI set
const mongoUri = process.env.MONGO_URI;
if (mongoUri && !mongoUri.includes('<username>')) {
  const mongoose = require('mongoose');
  mongoose
    .connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('DB connection failed:', err));
} else {
  console.log('⚠️  No MongoDB URI set — running in DEMO mode (in-memory)');
}

// Routes
app.use('/api/sos', require('./routes/sos'));
app.use('/api/test', require('./routes/test')); // remove before production

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', mode: mongoUri && !mongoUri.includes('<username>') ? 'mongo' : 'demo' }));

setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
