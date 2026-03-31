import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Clock, ShieldCheck, UserCog } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ContactsPage from './components/ContactsPage';
import AlertHistory from './components/AlertHistory';
import ProfileSetup from './components/ProfileSetup';
import SOSActiveBanner from './components/SOSActiveBanner';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useIsMobile } from './hooks/useIsMobile';
import { useSOSQueue } from './hooks/useSOSQueue';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useNotifications } from './hooks/useNotifications';
import { useSocket } from './context/SocketContext';
import './index.css';

const DEFAULT_CONTACTS = [];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home',     Icon: LayoutDashboard },
  { id: 'contacts',  label: 'Contacts', Icon: Users },
  { id: 'history',   label: 'History',  Icon: Clock },
];

export default function App() {
  const [page, setPage]         = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile                = useIsMobile();
  const online                  = useOnlineStatus();

  const [profile, setProfile]   = useLocalStorage('safeguard_profile', null);
  const [contacts, setContacts] = useLocalStorage('safeguard_contacts', DEFAULT_CONTACTS);
  const [alerts, setAlerts]     = useLocalStorage('safeguard_alerts', []);

  const { requestPermission, notify } = useNotifications();
  const { liveAlerts } = useSocket();

  // Request notification permission on first load
  useEffect(() => { requestPermission(); }, []);

  // Show push notification when a live SOS comes in via socket
  useEffect(() => {
    if (liveAlerts.length === 0) return;
    const latest = liveAlerts[0];
    notify(
      '🚨 SOS Alert Received',
      `Emergency triggered at ${new Date(latest.timestamp).toLocaleTimeString()}`,
    );
  }, [liveAlerts]);

  // Auto-flush queued SOS when internet returns
  useSOSQueue((count) => {
    console.log(`Back online — ${count} queued SOS alert(s) sent.`);
  });

  // Show profile setup for first-time users
  if (!profile) {
    return <ProfileSetup onComplete={(p) => setProfile(p)} />;
  }

  const MOCK_USER = {
    id: '665f1b2c3e4a5b6c7d8e9f00',
    name: profile.name,
    phone: profile.phone,
    avatar: profile.name[0].toUpperCase(),
  };

  const addAlert = (alert) => setAlerts((prev) => [alert, ...prev]);
  const navigate = (p) => { setPage(p); setMenuOpen(false); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Desktop sidebar ── */}
      {!isMobile && <Sidebar page={page} setPage={navigate} user={MOCK_USER} onEditProfile={() => setProfile(null)} />}

      {/* ── Mobile: slide-in sidebar overlay ── */}
      {isMobile && menuOpen && (
        <>
          <div style={s.overlay} onClick={() => setMenuOpen(false)} />
          <div style={s.drawerWrap}>
            <Sidebar page={page} setPage={navigate} user={MOCK_USER} onEditProfile={() => { setProfile(null); setMenuOpen(false); }} />
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={s.topBar}>
            <button style={s.menuBtn} onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
              <span style={s.bar} /><span style={s.bar} /><span style={s.bar} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#e8315a" />
              <span style={s.brand}>SafeGuard</span>
            </div>
            <button style={s.editProfileBtn} onClick={() => setProfile(null)} title="Edit profile">
              <UserCog size={18} />
            </button>
          </div>
        )}

        {/* SOS Active Banner — always visible when SOS is active */}
        <SOSActiveBanner />

        {/* Offline banner */}
        {!online && (
          <div style={s.offlineBanner}>
            📵 You're offline — WhatsApp & calls still work. Email will send when reconnected.
          </div>
        )}

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', paddingBottom: isMobile ? 72 : 0 }}>
          {page === 'dashboard' && (
            <Dashboard user={MOCK_USER} contacts={contacts} onSOSTriggered={addAlert} isMobile={isMobile} />
          )}
          {page === 'contacts' && (
            <ContactsPage contacts={contacts} setContacts={setContacts} isMobile={isMobile} />
          )}
          {page === 'history' && <AlertHistory alerts={alerts} />}
        </main>

        {/* Mobile bottom nav */}
        {isMobile && (
          <nav style={s.bottomNav}>
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                style={{ ...s.navBtn, ...(page === id ? s.navActive : {}) }}
                onClick={() => navigate(id)}
              >
                <Icon size={20} />
                <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)', zIndex: 199,
  },
  drawerWrap: {
    position: 'fixed', top: 0, left: 0, height: '100vh',
    zIndex: 200, boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', background: '#13131a',
    borderBottom: '1px solid #2e2e3e',
    position: 'sticky', top: 0, zIndex: 50,
  },
  menuBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: 5, padding: 4,
  },
  bar: { display: 'block', width: 22, height: 2, background: '#f0f0f5', borderRadius: 2 },
  brand: { fontSize: 16, fontWeight: 700, color: '#f0f0f5' },
  editProfileBtn: {
    background: 'transparent', border: 'none', color: '#8888aa',
    cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4,
  },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: 64, background: '#13131a',
    borderTop: '1px solid #2e2e3e',
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    zIndex: 50,
  },
  navBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    background: 'transparent', color: '#8888aa',
    padding: '6px 0', border: 'none', cursor: 'pointer', flex: 1,
  },
  navActive: { color: '#e8315a' },
  offlineBanner: {
    background: 'rgba(245,158,11,0.15)',
    borderBottom: '1px solid rgba(245,158,11,0.3)',
    color: '#f59e0b', fontSize: 12, fontWeight: 500,
    padding: '8px 16px', textAlign: 'center',
  },
};
