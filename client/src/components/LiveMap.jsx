import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useSocket } from '../context/SocketContext';

// Fix default marker icons broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.DivIcon({
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#e8315a;border:3px solid #fff;box-shadow:0 0 12px rgba(232,49,90,0.8)"></div>`,
  className: '', iconSize: [18, 18], iconAnchor: [9, 9],
});

export default function LiveMap({ userId }) {
  const [pos, setPos]     = useState(null);
  const [error, setError] = useState(null);
  const { socket }        = useSocket();

  useEffect(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const coords = [p.coords.latitude, p.coords.longitude];
        setPos(coords);
        // Broadcast live location to anyone watching this user
        socket?.emit('location:update', { userId, lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => setError('Location access denied'),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [socket, userId]);

  const center = pos || [33.6844, 73.0479]; // fallback: Islamabad

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', height: 260, position: 'relative' }}>
      {error && (
        <div style={s.overlay}>{error} — enable location for live tracking</div>
      )}
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%', background: '#1a1a24' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {pos && (
          <>
            <Marker position={pos} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle
              center={pos}
              radius={80}
              pathOptions={{ color: '#e8315a', fillColor: '#e8315a', fillOpacity: 0.08, weight: 1 }}
            />
          </>
        )}
      </MapContainer>
      {pos && (
        <div style={s.coords}>
          {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
        </div>
      )}
    </div>
  );
}

const s = {
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 999,
    background: 'rgba(15,15,19,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: '#f59e0b',
    textAlign: 'center',
    padding: 16,
  },
  coords: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    zIndex: 999,
    background: 'rgba(15,15,19,0.75)',
    color: '#8888aa',
    fontSize: 11,
    padding: '4px 8px',
    borderRadius: 6,
    backdropFilter: 'blur(4px)',
  },
};
