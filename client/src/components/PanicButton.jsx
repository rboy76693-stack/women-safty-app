import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, CheckCircle, Users, WifiOff, Smartphone } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { queueSOS } from '../hooks/useSOSQueue';
import { useSocket } from '../context/SocketContext';

const COUNTDOWN    = 3;
const MIN_CONTACTS = 3;

export default function PanicButton({ userId, userName, contacts = [], onSOSTriggered }) {
  const [phase, setPhase]     = useState(() => localStorage.getItem('safeguard_active_alert') ? 'active' : 'idle');
  const [count, setCount]     = useState(COUNTDOWN);
  const [error, setError]     = useState(null);
  const [activeAlertId, setActiveAlertId] = useState(() => localStorage.getItem('safeguard_active_alert') || null);
  const [shakeEnabled, setShakeEnabled]   = useState(true);
  const timer  = useRef(null);
  const online = useOnlineStatus();
  const { socket } = useSocket();
  const hasEnoughContacts = contacts.length >= MIN_CONTACTS;

  // Shake to trigger SOS
  useShakeDetection(() => {
    if (phase === 'idle' && hasEnoughContacts) start();
  }, shakeEnabled && phase === 'idle');

  const vibrate = (p) => navigator.vibrate?.(p);

  const start = () => {
    if (!hasEnoughContacts) { setError(`Add at least ${MIN_CONTACTS} emergency contacts before using SOS.`); return; }
    setError(null); vibrate([100, 50, 100]); setPhase('countdown'); setCount(COUNTDOWN);
  };

  const cancel = () => { clearInterval(timer.current); vibrate(50); setPhase('idle'); setCount(COUNTDOWN); };

  const fire = async () => {
    setPhase('firing');
    vibrate([500, 100, 500, 100, 500]);
    setTimeout(async () => {
      setPhase('active');
      try {
        let lat = 0, lng = 0;
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          lat = pos.coords.latitude; lng = pos.coords.longitude;
        } catch { console.warn('Location unavailable'); }

        const payload = {
          userId, lat, lng, incidentType: 'SOS',
          userName: userName || 'SafeGuard User',
          emergencyContacts: contacts.map((c) => ({ name: c.name, phone: c.phone, email: c.email })),
        };

        if (online) {
          const resp = await fetch('/api/sos/trigger', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await resp.json();
          setActiveAlertId(data.alertId);
          localStorage.setItem('safeguard_active_alert', data.alertId);
          onSOSTriggered?.({ alertId: data.alertId, lat, lng, incidentType: 'SOS', status: 'ACTIVE', timestamp: new Date().toISOString() });
        } else {
          const offlineId = `offline-${Date.now()}`;
          setActiveAlertId(offlineId);
          localStorage.setItem('safeguard_active_alert', offlineId);
          queueSOS(payload);
          onSOSTriggered?.({ alertId: offlineId, lat, lng, incidentType: 'SOS', status: 'QUEUED', timestamp: new Date().toISOString() });
        }
      } catch (e) {
        console.error('SOS failed:', e);
        setError('Failed to send SOS. Check your connection.');
        setPhase('idle');
      }
    }, 600);
  };

  // Broadcast live location while SOS is active
  useEffect(() => {
    if (phase !== 'active' || !activeAlertId) return;
    const id = navigator.geolocation?.watchPosition((p) => {
      socket?.emit('location:update', { userId, alertId: activeAlertId, lat: p.coords.latitude, lng: p.coords.longitude });
    }, null, { enableHighAccuracy: true });
    return () => id && navigator.geolocation.clearWatch(id);
  }, [phase, activeAlertId]);

  const markSafe = async () => {
    if (activeAlertId && online) {
      try { await fetch(`/api/sos/resolve/${activeAlertId}`, { method: 'POST' }); } catch { }
    }
    localStorage.removeItem('safeguard_active_alert');
    setPhase('idle'); setActiveAlertId(null);
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    timer.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer.current);
          fire();
          return 0;
        }
        vibrate(80);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [phase]);

  // SVG arc progress — goes from full circle down to 0
  const radius  = 62;
  const circ    = 2 * Math.PI * radius;
  const elapsed = COUNTDOWN - count; // how many seconds have passed
  const dashOffset = phase === 'countdown' || phase === 'firing'
    ? circ * (count / COUNTDOWN)   // shrinks as count goes down
    : circ;

  const isCounting = phase === 'countdown' || phase === 'firing';

  return (
    <div style={s.wrap}>
      <div style={s.label}>Emergency SOS</div>
      <div style={s.sub}>Press to alert your emergency contacts</div>

      {/* Contact count badge */}
      <div style={{ ...s.contactBadge, ...(hasEnoughContacts ? s.contactOk : s.contactWarn) }}>
        <Users size={12} />
        {contacts.length} / {MIN_CONTACTS} contacts
        {!hasEnoughContacts && ' — add more'}
      </div>

      {/* Shake to SOS toggle */}
      <button style={s.shakeToggle} onClick={() => setShakeEnabled(e => !e)}>
        <Smartphone size={12} />
        Shake to SOS: {shakeEnabled ? 'ON' : 'OFF'}
      </button>

      {/* ── IDLE ── */}
      {phase === 'idle' && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '20px 0' }}>
          <button
            style={{ ...s.btn, ...(hasEnoughContacts ? {} : s.btnDisabled) }}
            onClick={start}
            aria-label="Trigger SOS"
          >
            {hasEnoughContacts && (
              <>
                <div style={s.ring1} />
                <div style={s.ring2} />
                <div style={s.ring3} />
              </>
            )}
            <div style={s.btnInner}>
              <AlertTriangle size={34} color="#fff" />
              <span style={s.btnText}>SOS</span>
            </div>
          </button>
        </div>
      )}

      {/* ── COUNTDOWN + FIRING (shows 0) ── */}
      {isCounting && (
        <div style={s.countdownWrap}>
          {/* Outer glow ring that pulses red */}
          <div style={s.glowRing} />

          {/* SVG arc */}
          <svg width={160} height={160} style={s.svg}>
            {/* Track */}
            <circle cx={80} cy={80} r={radius} fill="none" stroke="#2e2e3e" strokeWidth={7} />
            {/* Progress — drains clockwise */}
            <circle
              cx={80} cy={80} r={radius}
              fill="none"
              stroke={count <= 1 ? '#ff2244' : '#e8315a'}
              strokeWidth={7}
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s' }}
            />
          </svg>

          {/* Big number in centre */}
          <div style={{ ...s.countNum, ...(count === 0 ? s.countNumZero : {}) }}>
            {count}
          </div>

          {/* Inner red circle behind number */}
          <div style={{ ...s.innerCircle, ...(count === 0 ? s.innerCircleZero : {}) }} />

          {count > 0 && (
            <>
              <p style={s.countLabel}>Sending SOS in {count}s…</p>
              <button style={s.cancelBtn} onClick={cancel}>
                <X size={14} /> Cancel
              </button>
            </>
          )}
          {count === 0 && (
            <p style={{ ...s.countLabel, color: '#ff2244', fontWeight: 700 }}>Sending…</p>
          )}
        </div>
      )}

      {/* ── ACTIVE ── */}
      {phase === 'active' && (
        <div style={s.activeWrap} role="alert" aria-live="assertive">
          <div style={s.activeDot}>
            <CheckCircle size={38} color="#fff" />
            <div style={s.activePing} />
            <div style={s.activePing2} />
          </div>
          <p style={s.activeTitle}>SOS Sent</p>
          <div style={s.activeActions}>
            {online
              ? <>
                  <div style={s.activeChip}>✉ Email sent to all contacts</div>
                  <div style={s.activeChip}>💬 SMS sent to all contacts</div>
                </>
              : <div style={{ ...s.activeChip, ...s.offlineChip }}>
                  <WifiOff size={11} /> Queued — will send when back online
                </div>
            }
          </div>
          <button style={s.resetBtn} onClick={markSafe}>
            Mark as Safe
          </button>
        </div>
      )}

      {error && <p style={s.error}>{error}</p>}
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px 0',
    width: '100%',
  },
  label: { fontSize: 15, fontWeight: 700, color: '#f0f0f5' },
  sub:   { fontSize: 12, color: '#8888aa', textAlign: 'center' },

  contactBadge: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 600, padding: '4px 10px',
    borderRadius: 20, marginBottom: 12,
  },
  contactOk:   { background: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' },
  contactWarn: { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },

  // ── Idle button ──
  btn: {
    position: 'relative', width: 150, height: 150, borderRadius: '50%',
    background: 'linear-gradient(145deg, #e8315a, #b01035)',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 50px rgba(232,49,90,0.55), 0 0 100px rgba(232,49,90,0.2)',
    touchAction: 'manipulation',
    alignSelf: 'center', flexShrink: 0,
  },
  btnDisabled: {
    background: '#2a2a38', boxShadow: 'none', cursor: 'not-allowed', opacity: 0.55,
  },
  btnInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 },
  btnText:  { fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: 4 },

  ring1: {
    position: 'absolute', inset: -12, borderRadius: '50%',
    border: '2px solid rgba(232,49,90,0.5)',
    animation: 'pulse-ring 2s ease-out infinite',
  },
  ring2: {
    position: 'absolute', inset: -26, borderRadius: '50%',
    border: '2px solid rgba(232,49,90,0.3)',
    animation: 'pulse-ring 2s ease-out infinite 0.6s',
  },
  ring3: {
    position: 'absolute', inset: -42, borderRadius: '50%',
    border: '1px solid rgba(232,49,90,0.15)',
    animation: 'pulse-ring 2s ease-out infinite 1.1s',
  },

  // ── Countdown ──
  countdownWrap: {
    position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    width: 160,
  },
  glowRing: {
    position: 'absolute',
    top: -8, left: -8, right: -8,
    width: 176, height: 176,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(232,49,90,0.18) 0%, transparent 70%)',
    animation: 'pulse-ring 1s ease-out infinite',
    pointerEvents: 'none',
  },
  svg: {
    transform: 'rotate(-90deg)', // start arc from top
    filter: 'drop-shadow(0 0 8px rgba(232,49,90,0.6))',
  },
  innerCircle: {
    position: 'absolute',
    top: 30, left: 30,
    width: 100, height: 100,
    borderRadius: '50%',
    background: 'radial-gradient(circle, #2a0a12 0%, #1a1a24 100%)',
    transition: 'background 0.3s',
    zIndex: 0,
  },
  innerCircleZero: {
    background: 'radial-gradient(circle, #5a0018 0%, #2a0a12 100%)',
  },
  countNum: {
    position: 'absolute',
    top: 44,
    fontSize: 56,
    fontWeight: 900,
    color: '#e8315a',
    zIndex: 1,
    transition: 'transform 0.15s, color 0.3s',
    textShadow: '0 0 20px rgba(232,49,90,0.8)',
    lineHeight: 1,
  },
  countNumZero: {
    color: '#ff2244',
    transform: 'scale(1.2)',
    textShadow: '0 0 30px rgba(255,34,68,1)',
  },
  countLabel: {
    fontSize: 13, color: '#8888aa', marginTop: 4,
  },
  cancelBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 22px', borderRadius: 10,
    background: '#2e2e3e', color: '#f0f0f5',
    border: '1px solid #3e3e4e',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },

  // ── Active ──
  activeWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  activeDot: {
    position: 'relative', width: 90, height: 90, borderRadius: '50%',
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 40px rgba(34,197,94,0.6)',
  },
  activePing: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    background: 'rgba(34,197,94,0.35)',
    animation: 'ping 1.4s ease-out infinite',
  },
  activePing2: {
    position: 'absolute', inset: -12, borderRadius: '50%',
    background: 'rgba(34,197,94,0.15)',
    animation: 'ping 1.4s ease-out infinite 0.5s',
  },
  activeTitle: { fontSize: 20, fontWeight: 800, color: '#22c55e', marginTop: 6 },
  activeSub:   { fontSize: 12, color: '#8888aa' },
  activeActions: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' },
  activeChip: {
    fontSize: 12, color: '#22c55e', padding: '4px 12px',
    background: 'rgba(34,197,94,0.1)', borderRadius: 20,
    border: '1px solid rgba(34,197,94,0.25)',
  },
  offlineChip: {
    background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.25)',
    display: 'flex', alignItems: 'center', gap: 5,
  },
  resolveBtn: {
    marginTop: 8, padding: '9px 22px', borderRadius: 10,
    background: 'rgba(34,197,94,0.12)', color: '#22c55e',
    fontSize: 13, fontWeight: 600,
    border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer',
  },
  resetBtn: {
    marginTop: 8, padding: '9px 22px', borderRadius: 10,
    background: 'rgba(34,197,94,0.12)', color: '#22c55e',
    fontSize: 13, fontWeight: 600,
    border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer',
  },
  shakeToggle: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 10, fontWeight: 600, padding: '3px 10px',
    borderRadius: 20, marginBottom: 4, cursor: 'pointer',
    background: 'rgba(99,102,241,0.1)', color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.25)',
  },
  error: { fontSize: 12, color: '#f59e0b', marginTop: 8, textAlign: 'center', maxWidth: 210 },
};
