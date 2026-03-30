import PanicButton from './PanicButton';
import LiveMap from './LiveMap';
import StatusBar from './StatusBar';
import FakeCall from './FakeCall';
import SafeWalkTimer from './SafeWalkTimer';

export default function Dashboard({ user, contacts, onSOSTriggered }) {
  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.sub}>Stay safe, stay connected</p>
        </div>
        <StatusBar />
      </div>

      {/* Responsive grid — 1 col on mobile, 3 col on desktop */}
      <div style={s.grid}>
        <div style={{ ...s.card, ...s.cardAccent }}>
          <PanicButton userId={user.id} userName={user.name} contacts={contacts} onSOSTriggered={onSOSTriggered} />
        </div>

        <div style={{ ...s.card, ...s.mapCard }}>
          <div style={s.cardTitle}>Live Location</div>
          <LiveMap userId={user.id} />
        </div>

        <div style={s.card}>
          <FakeCall />
        </div>

        <div style={s.card}>
          <SafeWalkTimer userId={user.id} contacts={contacts} onSOSTriggered={onSOSTriggered} />
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    padding: 'clamp(16px, 4vw, 32px) clamp(12px, 4vw, 28px)',
    maxWidth: 1100,
    animation: 'fade-in 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: { fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: '#f0f0f5' },
  sub:   { fontSize: 13, color: '#8888aa', marginTop: 2 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#1a1a24',
    border: '1px solid #2e2e3e',
    borderRadius: 16,
    padding: 20,
    animation: 'fade-in 0.4s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardAccent: {
    border: '1px solid rgba(232,49,90,0.3)',
    background: 'linear-gradient(145deg, #1a1a24, #1f1520)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%',
  },
  mapCard: { gridColumn: 'span 2' },
  cardTitle: {
    fontSize: 13, fontWeight: 600, color: '#8888aa',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
  },
};
