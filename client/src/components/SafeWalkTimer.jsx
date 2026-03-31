import { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { queueSOS } from '../hooks/useSOSQueue';

export default function SafeWalkTimer({ userId, contacts = [], onSOSTriggered }) {
  const [minutes, setMinutes]     = useState(15);
  const [remaining, setRemaining] = useState(null);
  const [phase, setPhase]         = useState('idle');
  const timer  = useRef(null);
  const online = useOnlineStatus();

  const start   = () => { setRemaining(minutes * 60); setPhase('running'); };
  const stop    = () => { clearInterval(timer.current); setPhase('idle'); setRemaining(null); };
  const checkin = () => { clearInterval(timer.current); setPhase('idle'); setRemaining(null); };

  const fireSOSAlert = async () => {
    navigator.vibrate?.([800, 200, 800, 200, 800]);
    let lat = 0, lng = 0;
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch { }

    const payload = {
      userId, lat, lng, incidentType: 'SAFE_WALK_EXPIRED',
      emergencyContacts: contacts.map((c) => ({ name: c.name, phone: c.phone, email: c.email })),
    };

    // Send emails via EmailJS from browser
    sendSOSToAll(contacts, 'SafeGuard User', lat, lng, 'SAFE_WALK_EXPIRED').catch(e => console.error('[EmailJS]', e));

    if (online) {
      try {
        const resp = await fetch('/api/sos/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await resp.json();
        onSOSTriggered?.({ alertId: data.alertId, lat, lng, incidentType: 'SAFE_WALK_EXPIRED', status: 'ACTIVE', timestamp: new Date().toISOString() });
      } catch { queueSOS(payload); }
    } else {
      queueSOS(payload);
      onSOSTriggered?.({ alertId: `walk-offline-${Date.now()}`, lat, lng, incidentType: 'SAFE_WALK_EXPIRED', status: 'QUEUED', timestamp: new Date().toISOString() });
    }
  };

  useEffect(() => {
    if (phase !== 'running') return;
    timer.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(timer.current); setPhase('expired'); fireSOSAlert(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [phase]);

  const fmt   = (sec) => String(Math.floor(sec/60)).padStart(2,'0') + ':' + String(sec%60).padStart(2,'0');
  const pct   = remaining !== null ? (remaining / (minutes * 60)) * 100 : 100;
  const color = pct > 50 ? '#22c55e' : pct > 20 ? '#f59e0b' : '#e8315a';

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <div style={{fontSize:15,fontWeight:700,color:'#f0f0f5'}}>Safe Walk Timer</div>
      <p style={{fontSize:12,color:'#8888aa',marginBottom:8}}>Auto-triggers SOS if you do not check in</p>

      {phase === 'idle' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:13,color:'#8888aa'}}>Duration (min)</span>
            <input type="number" min={1} max={120} value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              style={{width:64,padding:'6px 10px',borderRadius:8,background:'#13131a',border:'1px solid #2e2e3e',color:'#f0f0f5',fontSize:14,textAlign:'center'}} />
          </div>
          <button onClick={start} style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center',padding:'10px',borderRadius:10,width:'100%',background:'rgba(232,49,90,0.12)',color:'#e8315a',border:'1px solid rgba(232,49,90,0.3)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            <Play size={14} /> Start Timer
          </button>
        </>
      )}

      {(phase === 'running' || phase === 'expired') && (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,position:'relative'}}>
          <svg width={100} height={100} style={{transform:'rotate(-90deg)'}}>
            <circle cx={50} cy={50} r={42} fill="none" stroke="#2e2e3e" strokeWidth={6} />
            <circle cx={50} cy={50} r={42} fill="none" stroke={color} strokeWidth={6}
              strokeDasharray={2*Math.PI*42} strokeDashoffset={(1-pct/100)*2*Math.PI*42}
              strokeLinecap="round" style={{transition:'stroke-dashoffset 0.9s linear,stroke 0.5s'}} />
          </svg>
          <div style={{position:'absolute',top:32,fontSize:22,fontWeight:800,color}}>{fmt(remaining??0)}</div>
          {phase === 'expired'
            ? <div style={{fontSize:13,color:'#e8315a',fontWeight:600}}>SOS Auto-Triggered</div>
            : <div style={{display:'flex',gap:8}}>
                <button onClick={checkin} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,background:'rgba(34,197,94,0.12)',color:'#22c55e',border:'1px solid rgba(34,197,94,0.3)',fontSize:12,fontWeight:600,cursor:'pointer'}}><RotateCcw size={13}/> I am Safe</button>
                <button onClick={stop} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,background:'#2e2e3e',color:'#8888aa',border:'1px solid #3e3e4e',fontSize:12,fontWeight:600,cursor:'pointer'}}><Square size={13}/> Stop</button>
              </div>
          }
        </div>
      )}
    </div>
  );
}


