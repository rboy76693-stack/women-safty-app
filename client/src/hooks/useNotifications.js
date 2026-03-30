import { useEffect, useState } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  // Show a local notification (works even without a push server)
  const notify = (title, body, url = '/') => {
    if (permission !== 'granted') return;
    navigator.serviceWorker?.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [300, 100, 300],
        tag: 'sos-alert',
        renotify: true,
        data: { url },
      });
    });
  };

  return { permission, requestPermission, notify };
}
