import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ProfileSetup({ onComplete }) {
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!phone.trim() || !/^\+?[\d\s\-()]{7,}$/.test(phone.trim())) {
      setError('Enter a valid phone number'); return;
    }
    onComplete({ name: name.trim(), phone: phone.trim() });
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}><ShieldCheck size={36} color="#e8315a" /></div>
        <h1 style={s.title}>Welcome to SafeGuard</h1>
        <p style={s.sub}>Set up your profile to get started</p>

        <div style={s.field}>
          <label style={s.label}>Your Name</label>
          <input style={s.input} placeholder="e.g. Sarah Ahmed"
            value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Your Phone Number</label>
          <input style={s.input} placeholder="+92-300-0000000" type="tel"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button style={s.btn} onClick={submit}>Get Started</button>
        <p style={s.note}>Your info is stored only on this device.</p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f13', padding: 16 },
  card: { background: '#1a1a24', border: '1px solid #2e2e3e', borderRadius: 20, padding: '36px 28px', width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 },
  icon: { display: 'flex', justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 800, color: '#f0f0f5', textAlign: 'center', margin: 0 },
  sub:   { fontSize: 13, color: '#8888aa', textAlign: 'center', margin: 0 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, color: '#8888aa', fontWeight: 500 },
  input: { padding: '10px 14px', borderRadius: 10, background: '#13131a', border: '1px solid #2e2e3e', color: '#f0f0f5', fontSize: 14 },
  error: { fontSize: 12, color: '#f59e0b', margin: 0 },
  btn:   { padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#e8315a,#b01035)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  note:  { fontSize: 11, color: '#555566', textAlign: 'center', margin: 0 },
};
