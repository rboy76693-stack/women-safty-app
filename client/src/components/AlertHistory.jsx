import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';

const TYPE_LABELS = {
  SOS: 'SOS Emergency',
  HARASSMENT: 'Harassment',
  ACCIDENT: 'Accident',
  SAFE_WALK_EXPIRED: 'Safe Walk Expired',
  OTHER: 'Other',
};

export default function AlertHistory({ alerts }) {
  return (
    <div style={s.page}>
      <h1 style={s.title}>Alert History</h1>
      <p style={s.sub}>{alerts.length} alert{alerts.length !== 1 ? 's' : ''} recorded this session</p>

      {alerts.length === 0 ? (
        <div style={s.empty}>
          <CheckCircle size={40} color="#22c55e" style={{ marginBottom: 12 }} />
          <p>No alerts triggered — stay safe out there.</p>
        </div>
      ) : (
        <div style={s.list}>
          {alerts.map((a, i) => (
            <div key={a.alertId || i} style={s.card}>
              <div style={{ ...s.iconWrap, background: a.status === 'RESOLVED' ? 'rgba(34,197,94,0.12)' : 'rgba(232,49,90,0.12)' }}>
                <AlertTriangle size={18} color={a.status === 'RESOLVED' ? '#22c55e' : '#e8315a'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.alertType}>{TYPE_LABELS[a.incidentType] || a.incidentType}</div>
                <div style={s.alertMeta}>
                  <Clock size={11} />
                  {new Date(a.timestamp).toLocaleString()}
                  {a.lat && (
                    <>
                      <MapPin size={11} style={{ marginLeft: 8 }} />
                      {Number(a.lat).toFixed(4)}, {Number(a.lng).toFixed(4)}
                    </>
                  )}
                </div>
              </div>
              <div style={{
                ...s.statusBadge,
                background: a.status === 'RESOLVED' ? 'rgba(34,197,94,0.12)' : 'rgba(232,49,90,0.12)',
                color: a.status === 'RESOLVED' ? '#22c55e' : '#e8315a',
                border: `1px solid ${a.status === 'RESOLVED' ? 'rgba(34,197,94,0.3)' : 'rgba(232,49,90,0.3)'}`,
              }}>
                {a.status || 'ACTIVE'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page:  { padding: '32px 28px', maxWidth: 700, animation: 'fade-in 0.3s ease' },
  title: { fontSize: 24, fontWeight: 800, color: '#f0f0f5', marginBottom: 4 },
  sub:   { fontSize: 13, color: '#8888aa', marginBottom: 28 },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '60px 0', color: '#8888aa', fontSize: 14,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 18px', borderRadius: 12,
    background: '#1a1a24', border: '1px solid #2e2e3e',
    animation: 'slide-in 0.2s ease',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  alertType: { fontSize: 14, fontWeight: 600, color: '#f0f0f5' },
  alertMeta: { fontSize: 12, color: '#8888aa', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 },
  statusBadge: {
    padding: '4px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 600, flexShrink: 0,
  },
};
