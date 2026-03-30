const { notifyContacts, notifyResolution, notifyLocationUpdate } = require('../services/notifier');

const demoAlerts = {}; // alertId → { userId, contacts, userName, pingCount, pingTimer }

const triggerSOS = async (req, res) => {
  const { userId, lat, lng, incidentType = 'SOS', emergencyContacts: bodyContacts, userName: bodyName } = req.body;

  if (!userId || lat === undefined || lng === undefined) {
    return res.status(400).json({ message: 'userId, lat, and lng are required' });
  }

  try {
    const contacts  = bodyContacts || [];
    const userName  = bodyName || 'SafeGuard User';
    const alertId   = `alert-${Date.now()}`;
    const appUrl    = process.env.APP_URL || null;

    // Store alert for resolution + location pings
    demoAlerts[alertId] = { userId, contacts, userName, pingCount: 0, pingTimer: null };

    // Send initial notifications
    await notifyContacts(contacts, userName, lat, lng, incidentType, alertId, appUrl);

    // Start recurring location ping every 2 minutes
    demoAlerts[alertId].pingTimer = setInterval(async () => {
      const alert = demoAlerts[alertId];
      if (!alert) return;
      alert.pingCount += 1;
      // Use last known location (updated via socket location:update)
      const { lastLat = lat, lastLng = lng } = alert;
      await notifyLocationUpdate(contacts, userName, lastLat, lastLng, alert.pingCount);
      // Stop after 5 pings (10 minutes)
      if (alert.pingCount >= 5) {
        clearInterval(alert.pingTimer);
      }
    }, 2 * 60 * 1000);

    // Broadcast via WebSocket
    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('sos:triggered', {
      alertId, userId, location: { lat, lng }, incidentType, timestamp: new Date(),
    });

    return res.status(200).json({ message: 'SOS triggered', alertId });
  } catch (err) {
    console.error('SOS trigger error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = demoAlerts[alertId];

    if (alert) {
      // Stop location pings
      clearInterval(alert.pingTimer);
      // Send resolution email to all contacts
      await notifyResolution(alert.contacts, alert.userName);
      delete demoAlerts[alertId];
    }

    const io = req.app.get('io');
    io.emit('sos:resolved', { alertId });

    return res.status(200).json({ message: 'Alert resolved' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Called by socket when user's location updates during active SOS
const updateAlertLocation = (alertId, lat, lng) => {
  if (demoAlerts[alertId]) {
    demoAlerts[alertId].lastLat = lat;
    demoAlerts[alertId].lastLng = lng;
  }
};

module.exports = { triggerSOS, resolveAlert, updateAlertLocation };
