import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const STATUSES = [
  { id: 'safe',    label: 'Safe',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: ShieldCheck },
  { id: 'caution', label: 'Caution', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Shield },
  { id: 'danger',  label: 'Danger',  color: '#e8315a', bg: 'rgba(232,49,90,0.12)',   icon: ShieldAlert },
];

export default function StatusBar() {
  const [status, setStatus] = useState('safe');
  const current = STATUSES.find((s) => s.id === status);
  const Icon = current.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <div style={{ ...s.badge, background: current.bg, color: current.color, border: `1px solid ${current.color}44` }}>
        <Icon size={14} />
        <span>{current.label}</span>
      </div>
      <div style={s.pills}>
        {STATUSES.map((st) => (
          <button
            key={st.id}
            style={{
              ...s.pill,
              background: status === st.id ? st.bg : 'transparent',
              color: status === st.id ? st.color : '#8888aa',
              border: `1px solid ${status === st.id ? st.color + '55' : '#2e2e3e'}`,
            }}
            onClick={() => setStatus(st.id)}
          >
            {st.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const s = {
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  pills: { display: 'flex', gap: 6 },
  pill: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
