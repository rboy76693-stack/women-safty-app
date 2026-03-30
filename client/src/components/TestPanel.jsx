import { useState } from 'react';
import { Send, CheckCircle, XCircle, FlaskConical, Mail } from 'lucide-react';

export default function TestPanel({ contacts }) {
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [smsStatus, setSmsStatus] = useState(null); // null | loading | ok | error
  const [emailStatus, setEmailStatus] = useState(null);
  const [smsResult, setSmsResult]   = useState(null);
  const [emailResult, setEmailResult] = useState(null);

  const testSMS = async () => {
    if (!phone.trim()) return;
    setSmsStatus('loading'); setSmsResult(null);
    try {
      const res  = await fetch('/api/test/sms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone.trim() }),
      });
      const data = await res.json();
      setSmsStatus(data.success ? 'ok' : 'error');
      setSmsResult(data);
    } catch (e) {
      setSmsStatus('error'); setSmsResult({ error: e.message });
    }
  };

  const testEmail = async () => {
    if (!email.trim()) return;
    setEmailStatus('loading'); setEmailResult(null);
    try {
      const res  = await fetch('/api/test/email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email.trim() }),
      });
      const data = await res.json();
      setEmailStatus(data.success ? 'ok' : 'error');
      setEmailResult(data);
    } catch (e) {
      setEmailStatus('error'); setEmailResult({ error: e.message });
    }
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <FlaskConical size={16} color="#f59e0b" />
        <span style={s.title}>Test Notifications</span>
        <span style={s.badge}>Dev Only</span>
      </div>
      <p style={s.desc}>Send test alerts to verify SMS and email are working before a real emergency.</p>

      {/* SMS Test */}
      <div style={s.section}>
        <div style={s.sectionLabel}>SMS via Textbelt</div>
        <div style={s.row}>
          <input style={s.input} placeholder="+923001234567"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && testSMS()} />
          <button style={s.sendBtn} onClick={testSMS} disabled={smsStatus === 'loading'}>
            {smsStatus === 'loading' ? <span style={s.spinner} /> : <Send size={14} />}
            {smsStatus === 'loading' ? 'Sending…' : 'Send Test SMS'}
          </button>
        </div>
        {contacts.length > 0 && (
          <div style={s.quickFill}>
            <span style={s.quickLabel}>Quick fill:</span>
            {contacts.filter(c => c.phone).map((c) => (
              <button key={c.id} style={s.chip} onClick={() => setPhone(c.phone)}>{c.name}</button>
            ))}
          </div>
        )}
        {smsStatus === 'ok' && (
          <div style={s.resultOk}>
            <CheckCircle size={14} /> SMS sent! Credits remaining: <strong>{smsResult?.quotaRemaining}</strong>
          </div>
        )}
        {smsStatus === 'error' && (
          <div style={s.resultErr}><XCircle size={14} /> {smsResult?.error || smsResult?.message}</div>
        )}
      </div>

      {/* Email Test */}
      <div style={s.section}>
        <div style={s.sectionLabel}>Email via Gmail</div>
        <div style={s.row}>
          <input style={s.input} placeholder="contact@email.com" type="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && testEmail()} />
          <button style={{ ...s.sendBtn, ...s.emailBtn }} onClick={testEmail} disabled={emailStatus === 'loading'}>
            {emailStatus === 'loading' ? <span style={s.spinner} /> : <Mail size={14} />}
            {emailStatus === 'loading' ? 'Sending…' : 'Send Test Email'}
          </button>
        </div>
        {contacts.length > 0 && (
          <div style={s.quickFill}>
            <span style={s.quickLabel}>Quick fill:</span>
            {contacts.filter(c => c.email).map((c) => (
              <button key={c.id} style={s.chip} onClick={() => setEmail(c.email)}>{c.name}</button>
            ))}
          </div>
        )}
        {emailStatus === 'ok' && (
          <div style={s.resultOk}><CheckCircle size={14} /> Email sent successfully!</div>
        )}
        {emailStatus === 'error' && (
          <div style={s.resultErr}><XCircle size={14} /> {emailResult?.error || emailResult?.message}</div>
        )}
      </div>
    </div>
  );
}

const s = {
  wrap:        { background: '#1a1a24', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: 20, marginTop: 20 },
  header:      { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  title:       { fontSize: 14, fontWeight: 700, color: '#f0f0f5', flex: 1 },
  badge:       { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
  desc:        { fontSize: 12, color: '#8888aa', marginBottom: 16 },
  section:     { marginBottom: 16 },
  sectionLabel:{ fontSize: 11, fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  row:         { display: 'flex', gap: 8, marginBottom: 8 },
  input:       { flex: 1, padding: '9px 12px', borderRadius: 8, background: '#13131a', border: '1px solid #2e2e3e', color: '#f0f0f5', fontSize: 13 },
  sendBtn:     { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  emailBtn:    { background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' },
  spinner:     { width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
  quickFill:   { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  quickLabel:  { fontSize: 11, color: '#8888aa' },
  chip:        { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#2e2e3e', color: '#f0f0f5', border: '1px solid #3e3e4e', cursor: 'pointer' },
  resultOk:    { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e', padding: '8px 12px', background: 'rgba(34,197,94,0.08)', borderRadius: 8 },
  resultErr:   { display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#e8315a', padding: '8px 12px', background: 'rgba(232,49,90,0.08)', borderRadius: 8 },
};
