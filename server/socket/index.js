const { updateAlertLocation } = require('../controllers/sosController');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('watch:user', ({ userId }) => {
      socket.join(`user:${userId}`);
    });

    socket.on('location:update', ({ userId, lat, lng, alertId }) => {
      socket.to(`user:${userId}`).emit('location:updated', { userId, lat, lng });
      // Update location for active SOS pings
      if (alertId) updateAlertLocation(alertId, lat, lng);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
