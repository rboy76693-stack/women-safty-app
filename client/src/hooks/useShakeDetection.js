import { useEffect, useRef } from 'react';

const THRESHOLD     = 15;  // acceleration threshold (m/s²)
const SHAKE_COUNT   = 3;   // shakes needed to trigger
const RESET_MS      = 1500; // reset count after this many ms

export function useShakeDetection(onShake, enabled = true) {
  const lastAcc   = useRef({ x: 0, y: 0, z: 0 });
  const shakeCount = useRef(0);
  const resetTimer = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof DeviceMotionEvent === 'undefined') return;

    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const dx = Math.abs(acc.x - lastAcc.current.x);
      const dy = Math.abs(acc.y - lastAcc.current.y);
      const dz = Math.abs(acc.z - lastAcc.current.z);

      lastAcc.current = { x: acc.x, y: acc.y, z: acc.z };

      if (dx + dy + dz > THRESHOLD) {
        shakeCount.current += 1;
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => { shakeCount.current = 0; }, RESET_MS);

        if (shakeCount.current >= SHAKE_COUNT) {
          shakeCount.current = 0;
          onShake?.();
        }
      }
    };

    // iOS 13+ requires permission
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then((r) => { if (r === 'granted') window.addEventListener('devicemotion', handleMotion); })
        .catch(() => {});
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, onShake]);
}
