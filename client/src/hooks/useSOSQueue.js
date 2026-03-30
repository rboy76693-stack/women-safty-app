import { useEffect, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

const QUEUE_KEY = 'safeguard_sos_queue';

// Save a pending SOS to localStorage queue
export function queueSOS(payload) {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  queue.push({ ...payload, queuedAt: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  console.log('[SOS Queue] Saved offline SOS, will retry when online');
}

// Hook — watches for internet return and flushes the queue
export function useSOSQueue(onFlushed) {
  const online   = useOnlineStatus();
  const flushing = useRef(false);

  useEffect(() => {
    if (!online || flushing.current) return;

    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    flushing.current = true;
    console.log(`[SOS Queue] Back online — flushing ${queue.length} queued SOS(es)`);

    Promise.allSettled(
      queue.map((payload) => {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        return fetch(`${base}/api/sos/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });
      })
    ).then((results) => {
      const sent   = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      console.log(`[SOS Queue] Flushed: ${sent} sent, ${failed} failed`);

      // Clear successfully sent ones
      if (failed === 0) {
        localStorage.removeItem(QUEUE_KEY);
      } else {
        // Keep only failed ones
        const remaining = queue.filter((_, i) => results[i].status === 'rejected');
        localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      }

      if (sent > 0) onFlushed?.(sent);
      flushing.current = false;
    });
  }, [online]);

  return online;
}
