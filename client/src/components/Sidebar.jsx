import { LayoutDashboard, Users, Clock, ShieldCheck, Wifi, WifiOff, Pencil } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'contacts',  label: 'Contacts',  icon: Users },
  { id: 'history',   label: 'History',   icon: Clock },
];

export default function Sidebar({ page, setPage, user, onEditProfile }) {
  const { connected } = useSocket();
  return (
    <aside style={s.sidebar}>
      {/* Brand */}
      <div style={s.brand}>
        <div style={s.brandIcon}><ShieldCheck size={22} color="#e8315a" /></div>
        <div>
          <div style={s.brandName}>SafeGuard</div>
          <div style={s.brandSub}>Women's Safety</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            style={{ ...s.navBtn, ...(page === id ? s.navActive : {}) }}
            onClick={() => setPage(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={s.userCard}>
        <div style={s.avatar}>{user.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={s.userName}>{user.name}</div>
          <div style={s.userPhone}>{user.phone}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={onEditProfile} style={s.editBtn} title="Edit profile">
            <Pencil size={13} />
          </button>
          <div title={connected ? 'Live' : 'Connecting…'}>
            {connected ? <Wifi size={14} color="#22c55e" /> : <WifiOff size={14} color="#f59e0b" />}
          </div>
        </div>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: 220,
    minHeight: '100vh',
    background: '#13131a',
    borderRight: '1px solid #2e2e3e',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 12px',
    gap: 8,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 8px 24px',
    borderBottom: '1px solid #2e2e3e',
    marginBottom: 8,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: 'rgba(232,49,90,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 15, fontWeight: 700, color: '#f0f0f5' },
  brandSub:  { fontSize: 11, color: '#8888aa' },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    background: 'transparent',
    color: '#8888aa',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s',
    width: '100%',
    textAlign: 'left',
  },
  navActive: {
    background: 'rgba(232,49,90,0.12)',
    color: '#e8315a',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px',
    borderRadius: 12,
    background: '#1a1a24',
    marginTop: 'auto',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#e8315a,#ff6b8a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userName:  { fontSize: 13, fontWeight: 600, color: '#f0f0f5' },
  userPhone: { fontSize: 11, color: '#8888aa' },
  editBtn:   { background: 'transparent', border: 'none', color: '#8888aa', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' },
};
