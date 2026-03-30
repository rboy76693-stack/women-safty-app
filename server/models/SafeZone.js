const mongoose = require('mongoose');

const safeZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // GeoJSON polygon for geofencing
  coordinates: {
    type: { type: String, enum: ['Polygon'], required: true },
    coordinates: { type: [[[Number]]], required: true }, // array of rings
  },
  safetyRating: { type: Number, min: 1, max: 5, default: 3 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

safeZoneSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('SafeZone', safeZoneSchema);
