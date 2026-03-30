/**
 * Notifier service — Email only via Gmail
 */
const nodemailer = require('nodemailer');

let transport = null;
const getTransport = () => {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });
  }
  return transport;
};

const sendEmail = async (contact, userName, lat, lng, incidentType, alertId) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('[Notifier] Gmail not configured — skipping email');
    return;
  }
  if (!contact.email) return;

  const locationUrl = lat !== 0 ? `https://maps.google.com/?q=${lat},${lng}` : null;

  await getTransport().sendMail({
    from: `"SafeGuard Alert" <${process.env.GMAIL_USER}>`,
    to: contact.email,
    subject: `EMERGENCY: ${userName} needs help!`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px">
        <h2 style="color:#e8315a">SOS Alert</h2>
        <p>Automated emergency alert from SafeGuard.</p>
        <p><strong>${userName}</strong> triggered an emergency SOS.</p>
        <p>Type: <strong>${incidentType}</strong></p>
        <p>Time: <strong>${new Date().toLocaleString()}</strong></p>
        ${locationUrl ? `<a href="${locationUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e8315a;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">View Location on Map</a>` : '<p style="color:#f59e0b">Location unavailable</p>'}
        <p style="margin-top:24px;font-size:12px;color:#666">Sent by SafeGuard Women\'s Safety App</p>
      </div>
    `,
  });
  console.log(`[Notifier] Email sent to ${contact.email}`);
};

const sendResolutionEmail = async (contact, userName) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !contact.email) return;
  await getTransport().sendMail({
    from: `"SafeGuard Alert" <${process.env.GMAIL_USER}>`,
    to: contact.email,
    subject: `${userName} is safe now`,
    html: `<div style="font-family:sans-serif;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px"><h2 style="color:#22c55e">All Clear</h2><p><strong>${userName}</strong> has marked themselves as safe.</p></div>`,
  });
  console.log(`[Notifier] Resolution email sent to ${contact.email}`);
};

const notifyContacts = async (contacts, userName, lat, lng, incidentType, alertId) => {
  console.log(`[Notifier] Sending emails to ${contacts.filter(c => c.email).length} contacts`);
  const tasks = contacts
    .filter(c => c.email)
    .map(c => sendEmail(c, userName, lat, lng, incidentType, alertId));
  const results = await Promise.allSettled(tasks);
  results.filter(r => r.status === 'rejected').forEach(f => console.error('[Notifier] Failed:', f.reason?.message));
  console.log(`[Notifier] ${results.filter(r => r.status === 'fulfilled').length}/${results.length} emails dispatched`);
};

const notifyResolution = async (contacts, userName) => {
  const tasks = contacts.filter(c => c.email).map(c => sendResolutionEmail(c, userName));
  await Promise.allSettled(tasks);
};

const notifyLocationUpdate = async (contacts, userName, lat, lng, pingNum) => {
  if (lat === 0 && lng === 0) return;
  const locationUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const tasks = contacts.filter(c => c.email).map(c =>
    getTransport().sendMail({
      from: `"SafeGuard Alert" <${process.env.GMAIL_USER}>`,
      to: c.email,
      subject: `Location Update #${pingNum} — ${userName}`,
      html: `<div style="font-family:sans-serif;padding:24px;background:#0f0f13;color:#f0f0f5;border-radius:12px"><h2 style="color:#f59e0b">Location Update</h2><p>Updated location for <strong>${userName}</strong></p><a href="${locationUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#f59e0b;color:#000;border-radius:8px;text-decoration:none;font-weight:700">View Updated Location</a></div>`,
    })
  );
  await Promise.allSettled(tasks);
};

module.exports = { notifyContacts, notifyResolution, notifyLocationUpdate };
