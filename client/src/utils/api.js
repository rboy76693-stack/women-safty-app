const BASE = import.meta.env.VITE_BACKEND_URL || 'https://women-safty-app-wyoh.onrender.com';

export const apiPost = (path, body) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
