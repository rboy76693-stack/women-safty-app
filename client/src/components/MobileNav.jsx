import { LayoutDashboard, Users, Clock } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Home',     icon: LayoutDashboard },
  { id: 'contacts',  label: 'Contacts', icon: Users },
  { id: 'history',   label: 'History',  icon: Clock },
];

export default function MobileNav({ page, setPage }) {
  return (
    <nav style={s.nav}>
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          style={{ ...s.btn, ...(page === id ? s.active : {}) }}
          onClick={() => setPage(id)}
        >
          <Icon size={20} />
          <span style={s.label}>{label}</span>
        </button>
      ))}
    </nav>
  );
}

const s = {
  nav: {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    height: 64,
    background: '#13131a',
    borderTop: '1px solid #2e2e3e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 50,
    // Only show on mobile
    display: 'none',
  },
  btn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    background: 'transparent', color: '#8888aa',
    padding: '8px 20px', borderRadius: 10,
    border: 'none', cursor: 'pointer',
    transition: 'color 0.15s',
  },
  active: { color: '#e8315a' },
  label: { fontSize: 10, fontWeight: 600 },
};
