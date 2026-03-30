const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  incidentType: {
    type: String,
    enum: ['SOS', 'HARASSMENT', 'ACCIDENT', 'OTHER'],
    default: 'SOS',
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  status: { type: String, enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
