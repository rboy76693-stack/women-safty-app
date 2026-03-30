import { useState } from 'react';
import { UserPlus, Trash2, Phone, User, ShieldCheck, AlertCircle } from 'lucide-react';
import TestPanel from './TestPanel';

const MIN_CONTACTS = 3;

export default function ContactsPage({ contacts, setContacts, isMobile = false }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', relation: '' });
  const [error, setError] = useState('');

  const add = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required'); return;
    }
    // Basic phone format check
    if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone.trim())) {
      setError('Enter a valid phone number (e.g. +92-300-1234567)'); return;
    }
    setContacts((prev) => [...prev, { ...form, id: Date.now() }]);
    setForm({ name: '', phone: '', email: '', relation: '' });
    setError('');
  };

  const remove = (id) => {
    if (contacts.length <= MIN_CONTACTS) {
      setError(`You need at least ${MIN_CONTACTS} emergency contacts. Add a new one before removing.`);
      return;
    }
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const remaining = Math.max(0, MIN_CONTACTS - contacts.length);
  const isReady = contacts.length >= MIN_CONTACTS;

  return (
    <div style={s.page}>
      <h1 style={s.title}>Emergency Contacts</h1>
      <p style={s.sub}>These contacts will be notified via SMS when you trigger SOS</p>

      {/* Progress banner */}
      <div style={{ ...s.banner, ...(isReady ? s.bannerOk : s.bannerWarn) }}>
        {isReady
          ? <><ShieldCheck size={16} /> SOS is active — {contacts.length} contacts will be notified</>
          : <><AlertCircle size={16} /> Add {remaining} more contact{remaining !== 1 ? 's' : ''} to enable SOS</>
        }
        {/* Progress dots */}
        <div style={s.dots}>
          {Array.from({ length: MIN_CONTACTS }).map((_, i) => (
            <div key={i} style={{ ...s.dot, background: i < contacts.length ? (isReady ? '#22c55e' : '#f59e0b') : '#2e2e3e' }} />
          ))}
          {contacts.length > MIN_CONTACTS && (
            <span style={{ fontSize: 11, color: '#8888aa' }}>+{contacts.length - MIN_CONTACTS} more</span>
          )}
        </div>
      </div>

      {/* Add form */}
      <div style={s.card}>
        <div style={s.cardTitle}>Add New Contact</div>
        <div style={{ ...s.formGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr' }}>
          <div style={s.field}>
            <label style={s.label}>Full Name *</label>
            <input
              style={s.input} placeholder="e.g. Mom"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Phone Number</label>
            <input
              style={s.input} placeholder="+92-300-0000000"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email (for alerts)</label>
            <input
              style={s.input} placeholder="contact@email.com" type="email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Relation</label>
            <input
              style={s.input} placeholder="e.g. Mother, Friend"
              value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
          </div>
        </div>
        {error && <p style={s.error}><AlertCircle size={12} /> {error}</p>}
        <button style={s.addBtn} onClick={add}>
          <UserPlus size={16} /> Add Contact
        </button>
      </div>

      {/* Contact list */}
      <div style={s.list}>
        {contacts.length === 0 && (
          <div style={s.empty}>No contacts yet — add at least {MIN_CONTACTS} to enable SOS.</div>
        )}
        {contacts.map((c, i) => (
          <div key={c.id} style={s.contactCard}>
            <div style={s.indexBadge}>{i + 1}</div>
            <div style={s.avatar}>{c.name[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={s.contactName}>{c.name}</div>
              <div style={s.contactMeta}>
                <Phone size={11} /> {c.phone || '—'}
                {c.email && <><span style={{ margin: '0 4px' }}>·</span>✉ {c.email}</>}
                {c.relation && <><span style={{ margin: '0 4px' }}>·</span><User size={11} /> {c.relation}</>}
              </div>
            </div>
            {/* SMS indicator */}
            <div style={s.smsBadge} title="Will receive SMS on SOS">SMS</div>
            <button
              style={s.deleteBtn}
              onClick={() => remove(c.id)}
              aria-label={`Remove ${c.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      {/* SMS Test Panel */}
      <TestPanel contacts={contacts} />
    </div>
  );
}

const s = {
  page:  { padding: '32px 28px', maxWidth: 700, animation: 'fade-in 0.3s ease' },
  title: { fontSize: 24, fontWeight: 800, color: '#f0f0f5', marginBottom: 4 },
  sub:   { fontSize: 13, color: '#8888aa', marginBottom: 20 },

  banner: {
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
    padding: '12px 16px', borderRadius: 12, marginBottom: 24,
    fontSize: 13, fontWeight: 600,
  },
  bannerOk:   { background: 'rgba(34,197,94,0.1)',  color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' },
  bannerWarn: { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' },
  dots: { display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' },
  dot:  { width: 10, height: 10, borderRadius: '50%', transition: 'background 0.3s' },

  card:  { background: '#1a1a24', border: '1px solid #2e2e3e', borderRadius: 16, padding: 24, marginBottom: 24 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: 'var(--form-cols, 1fr 1fr 1fr 1fr)', gap: 12, marginBottom: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, color: '#8888aa', fontWeight: 500 },
  input: {
    padding: '9px 12px', borderRadius: 8,
    background: '#13131a', border: '1px solid #2e2e3e',
    color: '#f0f0f5', fontSize: 13,
  },
  error: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 12, color: '#f59e0b', marginBottom: 10,
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 10,
    background: 'rgba(232,49,90,0.12)', color: '#e8315a',
    border: '1px solid rgba(232,49,90,0.3)', fontSize: 13, fontWeight: 600,
  },

  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { color: '#8888aa', fontSize: 14, textAlign: 'center', padding: 32 },
  contactCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 18px', borderRadius: 12,
    background: '#1a1a24', border: '1px solid #2e2e3e',
    animation: 'slide-in 0.2s ease',
  },
  indexBadge: {
    width: 22, height: 22, borderRadius: '50%',
    background: '#2e2e3e', color: '#8888aa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  avatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'linear-gradient(135deg,#e8315a,#ff6b8a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  contactName: { fontSize: 14, fontWeight: 600, color: '#f0f0f5' },
  contactMeta: { fontSize: 12, color: '#8888aa', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 },
  smsBadge: {
    padding: '3px 8px', borderRadius: 6,
    background: 'rgba(34,197,94,0.1)', color: '#22c55e',
    border: '1px solid rgba(34,197,94,0.2)',
    fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 8, borderRadius: 8,
    background: 'transparent', color: '#8888aa',
  },
};
