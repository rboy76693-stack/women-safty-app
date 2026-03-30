import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, PhoneCall } from 'lucide-react';

const CALLERS = ['Mom', 'Aisha Khan', 'Dr. Fatima', 'Office'];

export default function FakeCall() {
  const [phase, setPhase] = useState('idle'); // idle | ringing | active
  const [caller] = useState(CALLERS[Math.floor(Math.random() * CALLERS.length)]);
  const [duration, setDuration] = useState(0);
  const timer = useRef(null);

  const ring = () => {
    navigator.vibrate?.([400, 200, 400, 200, 400]);
    setPhase('ringing');
  };

  const answer = () => {
    setPhase('active');
    setDuration(0);
    timer.current = setInterval(() => setDuration((d) => d + 1), 1000);
  };

  const end = () => {
    clearInterval(timer.current);
    navigator.vibrate?.(50);
    setPhase('idle');
    setDuration(0);
  };

  useEffect(() => () => clearInterval(timer.current), []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={s.wrap}>
      <div style={s.title}>Fake Call</div>
      <p style={s.desc}>Simulate an incoming call to exit unsafe situations</p>

      {phase === 'idle' && (
        <button style={s.triggerBtn} onClick={ring}>
          <Phone size={16} /> Trigger Fake Call
        </button>
      )}

      {phase === 'ringing' && (
        <div style={s.callCard}>
          <div style={s.callerAvatar}>{caller[0]}</div>
          <div style={s.callerName}>{caller}</div>
          <div style={s.callerSub}>Incoming call…</div>
          <div style={s.callActions}>
            <button style={s.declineBtn} onClick={end}><PhoneOff size={18} /></button>
            <button style={s.answerBtn} onClick={answer}><Phone size={18} /></button>
          </div>
        </div>
      )}

      {phase === 'active' && (
        <div style={s.callCard}>
          <div style={{ ...s.callerAvatar, background: '#22c55e' }}>{caller[0]}</div>
          <div style={s.callerName}>{caller}</div>
          <div style={s.callerSub}>{fmt(duration)}</div>
          <button style={s.endBtn} onClick={end}><PhoneOff size={18} /> End Call</button>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap:  { display: 'flex', flexDirection: 'column', gap: 8 },
  title: { fontSize: 15, fontWeight: 700, color: '#f0f0f5' },
  desc:  { fontSize: 12, color: '#8888aa', marginBottom: 12 },
  triggerBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', borderRadius: 10,
    background: 'rgba(34,197,94,0.12)', color: '#22c55e',
    border: '1px solid rgba(34,197,94,0.3)', fontSize: 13, fontWeight: 600,
    width: '100%', justifyContent: 'center',
  },
  callCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: '16px', borderRadius: 12,
    background: '#13131a', border: '1px solid #2e2e3e',
  },
  callerAvatar: {
    width: 48, height: 48, borderRadius: '50%',
    background: 'linear-gradient(135deg,#e8315a,#ff6b8a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 700, color: '#fff',
  },
  callerName: { fontSize: 15, fontWeight: 700, color: '#f0f0f5' },
  callerSub:  { fontSize: 12, color: '#8888aa' },
  callActions: { display: 'flex', gap: 20, marginTop: 8 },
  declineBtn: {
    width: 44, height: 44, borderRadius: '50%',
    background: '#e8315a', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  answerBtn: {
    width: 44, height: 44, borderRadius: '50%',
    background: '#22c55e', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  endBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 20px', borderRadius: 8,
    background: 'rgba(232,49,90,0.12)', color: '#e8315a',
    border: '1px solid rgba(232,49,90,0.3)', fontSize: 13, fontWeight: 600,
    marginTop: 4,
  },
};
