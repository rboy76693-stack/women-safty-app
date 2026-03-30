/**
 * Notifier service
 * SMS   → Textbelt
 * Email → Gmail
 */
const nodemailer = require('nodemailer');

const getTransport = () => nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

// ── SMS via Textbelt ─────────────────────────────────────────────────────────
const sendSMS = async (contact, userName, lat, lng, incidentType) => {
  const key = process.env.TEXTBELT_KEY;
  if (!key || !contact.phone) return;

  const locationUrl = lat !== 0 ? `https://maps.google.com/?q=${lat},${lng}` : 'Location unavailable';
  const body = `EMERGENCY: ${userName} needs help! (${incidentType}) Location: ${locationUrl}`;

  const resp = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: contact.phone, message: body, key }),
  });
  const data = await resp.json();
  if (data.success) {
    console.log(`[Notifier] SMS sent to ${contact.phone} (quota left: ${data.quotaRemaining})`);
  } else {
    throw new Error(`Textbelt error: ${data.error}`);
  }
};

// ── SOS Alert Email ──────────────────────────────────────────────────────────
const sendEmail = async (contact, userName, lat, lng, incidentType, alertId, appUrl) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !contact.email) return;

  const staticUrl  = lat !== 0 ? `https://maps.google.com/?q=${lat},${lng}` : null;
  // Live tracking link — works if app is deployed, falls back to static map
  const trackUrl   = appUrl ? `${appUrl}/track/${alertId}` : staticUrl;

  await getTransport().sendMail({
    from: `"SafeGuard Alert" <${process.env.GMAIL_USER}>`,
    to: contact.email,
    subject: `🚨 EMERGENCY: ${userName} needs help!`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px">
        <h2 style="color:#e8315a;margin-bottom:8px">🚨 SOS Alert</h2>
        <p style="color:#aaa;margin-bottom:20px">Automated emergency alert from SafeGuard.</p>
        <p><strong>${userName}</strong> triggered an emergency SOS.</p>
        <p>Type: <strong>${incidentType}</strong></p>
        <p>Time: <strong>${new Date().toLocaleString()}</strong></p>
        ${trackUrl ? `
        <a href="${trackUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e8315a;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">
          📍 Track Live Location
        </a>
        <p style="font-size:11px;color:#666;margin-top:8px">Link updates in real-time while alert is active</p>
        ` : '<p style="color:#f59e0b;margin-top:16px">Location unavailable</p>'}
        <p style="margin-top:24px;font-size:12px;color:#666">Sent by SafeGuard Women\'s Safety App</p>
      </div>
    `,
  });
  console.log(`[Notifier] SOS email sent to ${contact.email}`);
};

// ── Resolution Email ─────────────────────────────────────────────────────────
const sendResolutionEmail = async (contact, userName) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !contact.email) return;

  await getTransport().sendMail({
    from: `"SafeGuard Alert" <${process.env.GMAIL_USER}>`,
    to: contact.email,
    subject: `✅ ${userName} is safe now`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px">
        <h2 style="color:#22c55e;margin-bottom:8px">✅ All Clear</h2>
        <p><strong>${userName}</strong> has marked themselves as safe.</p>
        <p style="color:#aaa">The emergency alert has been resolved. No further action needed.</p>
        <p style="margin-top:24px;font-size:12px;color:#666">Sent by SafeGuard Women\'s Safety App</p>
      </div>
    `,
  });
  console.log(`[Notifier] Resolution email sent to ${contact.email}`);
};

// ── Location Update Email (recurring ping) ───────────────────────────────────
const sendLocationUpdate = async (contact, userName, lat, lng, pingNum) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !contact.email) return;
  if (lat === 0 && lng === 0) return;

  const locationUrl = `https://maps.google.com/?q=${lat},${lng}`;

  await getTransport().sendMail({
    from: `"SafeGuard Alert" <${process.env.GMAIL_USER}>`,
    to: contact.email,
    subject: `📍 Location Update #${pingNum} — ${userName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px">
        <h2 style="color:#f59e0b;margin-bottom:8px">📍 Location Update</h2>
        <p>Updated location for <strong>${userName}</strong> (still active SOS)</p>
        <p style="color:#aaa">Time: ${new Date().toLocaleString()}</p>
        <a href="${locationUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#f59e0b;color:#000;border-radius:8px;text-decoration:none;font-weight:700">
          View Updated Location
        </a>
        <p style="margin-top:24px;font-size:12px;color:#666">Sent by SafeGuard Women\'s Safety App</p>
      </div>
    `,
  });
  console.log(`[Notifier] Location update #${pingNum} sent to ${contact.email}`);
};

// ── Main exports ─────────────────────────────────────────────────────────────
const notifyContacts = async (contacts, userName, lat, lng, incidentType, alertId, appUrl) => {
  const tasks = contacts.flatMap((contact) => [
    sendSMS(contact, userName, lat, lng, incidentType),
    sendEmail(contact, userName, lat, lng, incidentType, alertId, appUrl),
  ]);
  const results = await Promise.allSettled(tasks);
  const sent    = results.filter((r) => r.status === 'fulfilled').length;
  results.filter((r) => r.status === 'rejected').forEach((f) => console.error('[Notifier] Failed:', f.reason?.message));
  console.log(`[Notifier] ${sent}/${results.length} notifications dispatched`);
};

const notifyResolution = async (contacts, userName) => {
  const tasks   = contacts.filter(c => c.email).map(c => sendResolutionEmail(c, userName));
  await Promise.allSettled(tasks);
};

const notifyLocationUpdate = async (contacts, userName, lat, lng, pingNum) => {
  const tasks = contacts.filter(c => c.email).map(c => sendLocationUpdate(c, userName, lat, lng, pingNum));
  await Promise.allSettled(tasks);
};

module.exports = { notifyContacts, notifyResolution, notifyLocationUpdate };
