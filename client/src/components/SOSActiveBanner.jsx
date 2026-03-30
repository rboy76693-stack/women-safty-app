import { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { apiPost } from '../utils/api';

export default function SOSActiveBanner() {
  const [alertId, setAlertId] = useState(() => localStorage.getItem('safeguard_active_alert'));
  const [resolving, setResolving] = useState(false);
  const online = useOnlineStatus();

  if (!alertId) return null;

  const markSafe = async () => {
    setResolving(true);
    if (online) {
      try { await apiPost(`/api/sos/resolve/${alertId}`, {}); } catch { }
    }
    localStorage.removeItem('safeguard_active_alert');
    setAlertId(null);
    setResolving(false);
    // Also reset PanicButton state by reloading
    window.location.reload();
  };

  return (
    <div style={s.banner}>
      <div style={s.left}>
        <ShieldAlert size={18} color="#e8315a" />
        <span style={s.text}>SOS Active — contacts are being notified</span>
      </div>
      <button style={s.btn} onClick={markSafe} disabled={resolving}>
        <ShieldCheck size={15} />
        {resolving ? 'Resolving…' : 'Mark as Safe'}
      </button>
    </div>
  );
}

const s = {
  banner: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'linear-gradient(90deg, #2a0a12, #1f0810)',
    borderBottom: '2px solid #e8315a',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', gap: 12,
    animation: 'fade-in 0.3s ease',
  },
  left: { display: 'flex', alignItems: 'center', gap: 8 },
  text: { fontSize: 13, fontWeight: 600, color: '#f0f0f5' },
  btn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8,
    background: 'rgba(34,197,94,0.15)', color: '#22c55e',
    border: '1px solid rgba(34,197,94,0.4)',
    fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
